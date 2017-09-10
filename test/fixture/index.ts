let reactive = (v: boolean) => {}
let direct = (v: boolean) => {}
class Sub {
  bar: boolean
}
@reactive
class TestReactive {
  foo = 'hi'
  bar = 3
  @direct
  sub: Sub
}
let t = new TestReactive()
@reactive
let b = t.bar + 4
@reactive
function foo() {
  alert('hi')
}