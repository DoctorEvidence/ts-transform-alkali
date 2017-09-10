var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let reactive = (v) => { };
let direct = (v) => { };
class Sub {
}
let TestReactive = class TestReactive {
    constructor() {
        this.foo = 'hi';
        this.bar = 3;
    }
};
TestReactive = __decorate([
    reactive.cls({ foo: "string", bar: "number" })
], TestReactive);
let t = new TestReactive();
let b = reactive.operator(t.bar, 4);
function foo() {
    reactive.fcall(alert, ['hi']);
}
