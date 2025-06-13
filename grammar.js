module.exports = grammar({
  name: 'latte',

  extras: $ => [
    $.comment,
    /\s+/,
  ],

  rules: {
    template: $ => repeat($._latte),

    _latte: $ => choice(
      $.templateType,
      $.inline,
      $.include,
      $.block,
      $.text,
      $.foreach,
      $.if,
      $.first,
      $.last,
      $.sep,
      // $.literal,
    ),

    _nested: $ => choice(
      $.inline,
      $.include,
      $.text,
      $.foreach,
      $.if,
      $.first,
      $.last,
      $.sep,
    ),

    templateType: $ => seq(
      "{templateType",
      $.fqcn,
      "}",
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
      field('iterable', alias(/\$[^\s]+/, $.php)),
      'as',
      field('key', alias(/\$[^\s=}]+/, $.key)),
      optional(seq(
        '=>',
        field('value', alias(/\$[^}]+/, $.value)),
      )),
      '}',
      field('body', alias(repeat($._nested), $.body)),
      field('alternative', optional($.else)),
      '{/foreach}',
    ),

    first: $ => seq(
      '{first}',
      field('body', alias(repeat($._nested), $.body)),
      '{/first}'
    ),

    last: $ => seq(
      '{last}',
      field('body', alias(repeat($._nested), $.body)),
      '{/last}'
    ),

    sep: $ => seq(
      '{sep}',
      field('body', alias(repeat($._nested), $.body)),
      '{/sep}'
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
    fqcn: $ => seq(
      $.fqn,
      $.class_name
    ),

    fqn: $ => seq(
      optional('\\'),
      $._namespace_part,
      repeat(seq('\\', $._namespace_part)),
      optional('\\'),
    ),

    _namespace_part: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
    class_name: $ => /[A-Z][a-zA-Z0-9_]*/,
  },
});
