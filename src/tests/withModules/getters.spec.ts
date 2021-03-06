import { expect } from "chai";
import * as Vuex from "vuex";
import { createStore, State } from "./store";
import * as basket from "./store/basket";

const Vue = require("vue");

describe("Given store with modules exposing getters", () => {
    let store: Vuex.Store<State>;

    beforeEach(() => {
        Vue.use(Vuex);
        store = createStore();
        store.replaceState({
            system: {
                userLogin: "abc",
                maxAllowedItems: 5,
            },
            basket: {
                items: [
                    { product: { id: 1, name: "clock", unitPrice: 50 }, isSelected: true },
                    { product: { id: 2, name: "newspaper", unitPrice: 20 }, isSelected: false },
                    { product: { id: 3, name: "candy", unitPrice: 10 }, isSelected: false },
                ],
                totalAmount: 80,
            },
        });
    });

    describe("when parameterless getter is accessed in a module using function built with read function", () => {
        let getterResult: string[];

        beforeEach(() => {
            getterResult = basket.readProductNames(store);
        });

        it("the function returns value of the getter", () => {
            expect(getterResult).to.deep.equal(["clock", "newspaper", "candy"]);
        });
    });

    describe("when getter having parameters is accessed in a module using function built with read function", () => {
        let getterResult: basket.ProductInBasket[];

        describe("and a value is passed in as argument", () => {
            beforeEach(() => {
                getterResult = basket.readItemsByStatus(store)(false);
            });

            it("the function returns value of the getter corresponding to the argument value", () => {
                expect(getterResult).to.deep.equal([
                    { product: { id: 2, name: "newspaper", unitPrice: 20 }, isSelected: false },
                    { product: { id: 3, name: "candy", unitPrice: 10 }, isSelected: false }]);
            });
        });

        describe("and another value is passed in as argument", () => {
            beforeEach(() => {
                getterResult = basket.readItemsByStatus(store)(true);
            });

            it("the function returns value of the getter corresponding to the other argument value", () => {
                expect(getterResult).to.deep.equal([
                    { product: { id: 1, name: "clock", unitPrice: 50 }, isSelected: true }]);
            });
        });
    });

    describe(
        "when getter that accesses a value outside its own module state" +
        "is accessed using function built with read function",
        () => {
        let getterResult: basket.ProductInBasket[];

        describe("and a root state value has been set", () => {
            beforeEach(() => {
                store.state.system.maxAllowedItems = 5;
                getterResult = basket.readLimitedItems(store);
            });

            it("the function returns value corresponding to the root state value that it references", () => {
                expect(getterResult).to.deep.equal([
                    { product: { id: 1, name: "clock", unitPrice: 50 }, isSelected: true },
                    { product: { id: 2, name: "newspaper", unitPrice: 20 }, isSelected: false },
                    { product: { id: 3, name: "candy", unitPrice: 10 }, isSelected: false }]);
            });
        });

        describe("and an updated root state value has been set that changes the getter result", () => {
            beforeEach(() => {
                store.state.system.maxAllowedItems = 2;
                getterResult = basket.readLimitedItems(store);
            });

            it(
                "the function returns value (a shortened array, in this case)" +
                "corresponding to the updated root state value that it references",
                () => {
                expect(getterResult).to.deep.equal([
                    { product: { id: 1, name: "clock", unitPrice: 50 }, isSelected: true },
                    { product: { id: 2, name: "newspaper", unitPrice: 20 }, isSelected: false }]);
            });
        });
    });
});
