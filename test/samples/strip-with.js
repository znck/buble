module.exports = [
  {
    description: 'strip with from Vue render functions',
    options: {
      transforms: { stripWith: true },
      objectAssign: 'Object.assign'
    },
    input: `
function render () {
  with (this) {
    return __vue_h__('div', items.map(function (item) {
      return __vue_h__('p', {
        class: [a, b + 'c', c ? d : item.e],
        style: { color, item, [prop]: true },
        inlineTemplate: {
          render: function () {
            with ({ any: this }) {
              return __vue_h__('span', [hi, arguments[1]])
            }
          }
        }
      }, item.tags.map(function (tag) {
        return __vue_h__('span', [item.id, tag.text, foo, a[b]])
      }), item.stuff.map(([a, b], { c }) => {
        return __vue_h__('p', [a, b, c])
      }))
    }))
}
}
`,
    output: `
function render () {
  var __vue_context__ = this
    return __vue_h__('div', __vue_context__.items.map(function (item) {
      return __vue_h__('p', {
        class: [__vue_context__.a, __vue_context__.b + 'c', __vue_context__.c ? __vue_context__.d : item.e],
        style: ( _obj = { color: __vue_context__.color, item: item }, _obj[__vue_context__.prop] = true, _obj ),
        inlineTemplate: {
          render: function () {
            var __vue_context__ = { any: this }
              return __vue_h__('span', [__vue_context__.hi, arguments[1]])
            
          }
        }
      }, item.tags.map(function (tag) {
        return __vue_h__('span', [item.id, tag.text, __vue_context__.foo, __vue_context__.a[__vue_context__.b]])
      }), item.stuff.map(function (ref, ref$1) {
        var a = ref[0];
        var b = ref[1];
        var c = ref$1.c;

        return __vue_h__('p', [a, b, c])
      }))
      var _obj;
    }))

}
`
  }
]
