import { defineComponent, h } from 'vue';
import { tokenize, options, Options } from 'linkifyjs';

function escapeText(text) {
	return text
	.replace(/&/g, '&amp;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;');
}

function linkifyVNode(str, opts, escape) {
	const tokens = tokenize(str);
	const result = [];

	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];

		if (token.t === 'nl' && opts.get('nl2br')) {
			result.push(h('br'));
		} else if (!token.isLink || !opts.check(token)) {
			result.push(escape ? escapeText(token.toString()) : token.toString());
		} else {
			result.push(opts.render(token));
		}
	}

	return result;
}

const defaultLinkRender = ({ tagName, attributes, content }) => {
	return h(tagName, attributes, content);
};

export default {
  name: 'Linkify',
  props: {
    options: {
      type: Object,
      default: options.defaults
    },
    tagName: {
      type: String,
      default: 'span'
    },
    text: {
      type: String,
      default: ''
    },
		escape: {
			type: Boolean,
			default: true,
		},
  },
  render() {
		const linkRender = this.$slots.default || defaultLinkRender;
		const linkifyOpts = new Options(this.options, linkRender);

		const children = linkifyVNode(this.text, linkifyOpts, this.escape);
		return h(this.tagName, { key: '__linkify-wrapper' }, children);
  },
};