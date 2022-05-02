import express from "express";
import {connectToDB} from "./db/mySQLConnection";
import {getPrice, upsertPrice} from "./db/priceRepository";
import {getHolidays} from "./db/holidaysRepository";

async function createApp() {
  const app = express()

  const connection = await connectToDB();

  // Ajout d'un endpoint pour ajouter un nouveau tarif ou mettre a jour un tarif
  app.put('/prices', async (req, res) => {
    await upsertPrice(connection, req.query.type, req.query.cost);
    res.json()
  })

  // Recupe du prix en fonction de plein de truc
  app.get('/prices', async (req, res) => {
    const age = req.query.age;
    const date = req.query.date;

    if (age < 6) {
      res.json({cost: calculateCost({cost: 0})});
      return {app, connection}
    }

    const result = await getPrice(connection, req.query.type);

    if (req.query.type === 'night') {
      if (age > 64) {
        res.json({cost: calculateCost({cost: result.cost, ageDiscount: .4})});
      } else {
        res.json(result)
      }
    } else {
      const holidays = (await getHolidays(connection, date));

      let isHoliday = holidays[0] !== undefined;
      let reduction = 0

      if (!isHoliday && new Date(date).getDay() === 1) {
        reduction = 35
      }

      // TODO apply reduction for others
      if (age < 15) {
        res.json({cost: calculateCost({cost: result.cost, ageDiscount: .7})});
      } else if (age > 64) {
        res.json({cost: calculateCost({cost: result.cost, ageDiscount: .75, mondayDiscount: reduction})});
      } else {
        res.json({cost: calculateCost({cost: result.cost, mondayDiscount: reduction} as CostData)});
      }
    }
  })
  return {app, connection};
}

interface CostData {
  cost: number,
  ageDiscount?: number,
  mondayDiscount?: number
}

function calculateCost(costData: CostData){
  const defaultVal: Required<Pick<CostData, 'ageDiscount' | 'mondayDiscount'>> = {ageDiscount: 1, mondayDiscount: 0}
  return Math.ceil(costData.cost * (costData.ageDiscount || defaultVal.ageDiscount) * (1 - (costData.mondayDiscount || defaultVal.mondayDiscount) / 100));
}

export {createApp}
