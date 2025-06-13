module.exports = grammar({
  name: 'smarty',

  extras: $ => [
    $.comment,
    /\s+/,
  ],

  rules: {
    template: $ => repeat($._smarty),

    _smarty: $ => choice(
      $.inline,
      $.include,
      $.block,
      $.text,
      $.foreach,
      $.if,
      $.nocache,
      // $.literal,
    ),

    _nested: $ => choice(
      $.inline,
      $.include,
      $.text,
      $.foreach,
      $.if,
      $.nocache,
    ),

    comment: $ => seq('{*', /[^*]*/, '*}'),

    inline: $ => seq(
      '{',
      alias($.text, $.php),
      repeat(seq(
        '|',
        $.modifier,
      )),
      '}'
    ),

    include: $ => seq(
      '{include',
      repeat($.parameter),
      '}',
    ),

    block: $ => seq(
      '{block',
      repeat($.parameter),
      '}',
      field('body', alias(repeat($._nested), $.body)),
      '{/block}',
    ),

    foreach: $ => seq(
      '{foreach',
      field('iterable', $.text),
      // /\$[^\s]+/,
      'as',
      // field('key', $.php),
      /\$[^\s=}]+/,
      optional(seq(
        '=>',
        // field('value', $.php),
        /\$[^}]+/,
      )),
      '}',
      field('body', alias(repeat($._nested), $.body)),
      field('alternative', optional($.else)),
      '{/foreach}',
    ),

    if: $ => seq(
      '{if',
      field('condition', alias(/[^}]+/, $.text)),
      '}',
      field('body', alias(repeat($._nested), $.body)),
      repeat(field('alternative', $.else_if)),
      optional(field('alternative', $.else)),
      '{/if}',
    ),

    else_if: $ => seq(
      '{elseif',
      field('condition', alias(/[^}]+/, $.text)),
      '}',
      field('body', alias(repeat($._nested), $.body)),
    ),

    else: $ => seq(
      '{else}',
      field('body', alias(repeat($._nested), $.body)),
    ),

    modifier: $ => seq(
      /[^|:}]+/,
      repeat(seq(
        ':',
        alias(/[^|:}]+/, $.parameter),
      )),
    ),

    // parameter: $ => /[^\s=]+[\s]*=[\s]*('[^']*'|"[^"]*"|\[[^]]*])/,
    // parameter: $ => /[^\s=]+[\s]*=[\s]*(('[^']*'|"[^"]*"|\[[^\]]*]|[^\s}]+))/,

    parameter: $ => choice(
      /[^\s=}]+/, // simple word-like parameters like `content`
      /[^\s=]+[\s]*=[\s]*(('[^']*'|"[^"]*"|\[[^\]]*\]|[^\s}]+))/
    ),

    // text: $ => prec(-1, /[^\s\|{*}-]([^\|{*}]*[^\|{*}-])?/),
    text: $ => token(prec(-1, /[^{}]+/)),
  },
});
