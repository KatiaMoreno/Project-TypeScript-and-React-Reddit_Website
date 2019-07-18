import { expect } from "chai";
import request from "supertest";
import { describe, it } from "mocha";
import { createApp } from "../src/backend/config/app";
import { getHandlers } from "../src/backend/controllers/user_controllet";
import { createDbConnection } from "../src/backend/config/db";
import { getConnection, Connection } from "typeorm";

describe("User controller", function () {

    let conn : Connection | undefined = undefined;

    // Create connection to DB before tests are executed
    before(async () => {
        conn = await createDbConnection();
    })

    // Clean up tables before each test
    beforeEach(async () => {
        return await getConnection().synchronize(true);
    });

    // Close database connection
    after(async () => {
        if (conn !== undefined) {
            return await conn.close();
        }
    });

    // This is an example of an unit test
    it("Should be able to create an user", function (done) {
        const credentials = {
            email: "test@test.com",
            password: "mysecret"
        };
        const mockUserRepository: any = {
            save: (newUser: any) => Promise.resolve({
                id: 1,
                email: newUser.email,
                password: newUser.password
            })
        };
        const mockRequest: any = {
            body: credentials
        };
        const mockResponse: any = {
            json: (data: any) => {
                return {
                    send: () => {
                        expect(data.ok).to.eq("ok");
                        done();
                    }
                };
            }
        };
        const handlers = getHandlers(mockUserRepository);
        handlers.createUser(mockRequest, mockResponse);
    });

    // This is an example of an integration tests
    it("HTTP POST /api/v1/user", function (done) {
        (async () => {

            const app = await createApp(conn);

            const credentials = {
                email: "test@test.com",
                password: "mysecret"
            };

            request(app)
                .post("/api/v1/users")
                .send(credentials)
                .set("Accept", "application/json")
                .expect(200)
                .expect(function(res) {
                    expect(res.body.ok).to.eq("ok");
                })
                .end(function(err, res) {
                    if (err) throw err;
                    done();
                });
        })();
    });

});
