import {assert, expect} from 'chai';
import request from 'supertest-as-promised';
import {createApp} from "../src/prices"

describe('prices', () => {

    let app, connection

    beforeEach(async () => {
        ({app, connection} = await createApp());

        // GIVEN
        await request(app).put('/prices?type=1jour&cost=35');
        await request(app).put('/prices?type=night&cost=19');
    });

    afterEach(function () {
        connection.close();
    });

    it('should be gratis if less than 6 years old', async () => {
        // WHEN
        const response = await request(app)
        .get('/prices?age=3');

        // THEN
        const expectedResult = { cost: 0 };
        expect(response.body).deep.equal(expectedResult);
    });

    // Les tests pour le jours
    it('should cost 35 bals for 1jour', async () => {
        // WHEN
        const response = await request(app)
        .get('/prices?age=27&type=1jour');

        // THEN
        const expectedResult = { cost: 35 };
        expect(response.body).deep.equal(expectedResult);
    });

    // Les tests pour la nuit
    it('should cost 19 bals for night', async () => {
        // WHEN
        const response = await request(app)
        .get('/prices?age=27&type=night');

        // THEN
        const expectedResult = { cost: 19 };
        expect(response.body).deep.equal(expectedResult);
    });

    it('should cost 19 bals with 60% discount for night', async () => {
        // WHEN
        const response = await request(app)
        .get('/prices?age=99&type=night');

        // THEN
        const expectedResult = { cost: 8 };
        expect(response.body).deep.equal(expectedResult);
    });

    it('should apply discount on Monday', async () => {
        // WHEN
        const response = await request(app)
        .get('/prices?date=2022-04-11&type=1jour');

        // THEN
        const expectedResult = { cost: 23 };
        expect(response.body).deep.equal(expectedResult)
    });

    it('should not apply discount on other day than Monday', async () => {
        // WHEN
        const response = await request(app)
        .get('/prices?date=2022-04-12&type=1jour');

        // THEN
        const expectedResult = { cost: 35 };
        expect(response.body).deep.equal(expectedResult)
    });

    it('should not apply discount on holidays Monday', async () => {
        // WHEN
        const response = await request(app)
        .get('/prices?date=2019-03-04&type=1jour');

        // THEN
        const expectedResult = { cost: 35 };
        expect(response.body).deep.equal(expectedResult)
    });

    it('should cost 35 bals with 30% discount if i am 15 less', async () => {
        // WHEN
        const response = await request(app)
        .get('/prices?age=9&type=1jour');

        // THEN
        const expectedResult = { cost: 25 };
        expect(response.body).deep.equal(expectedResult);
    });

    it('should cost 35 bals with 25% discount if i am 99', async () => {
        // WHEN
        const response = await request(app)
        .get('/prices?age=99&type=1jour');

        // THEN
        const expectedResult = { cost: 27 };
        expect(response.body).deep.equal(expectedResult);
    });
});
