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
      $.varType,
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
      $.varType,
    ),

    templateType: $ => seq(
      '{templateType',
      $.fqcn,
      '}',
    ),

    varType: $ => seq(
      '{varType',
      $.fqcn,
      alias(/\$[^}]+/, $.var),
      '}'
    ),

    var: $ => seq(
      '{var',
      alias(/\$[^=]+/, $.name),
      '=',
      alias(/[^}]+/, $.value),
      '}'
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
      optional(
        field('namespace',
          alias(
            seq(
              $.php_identifier,
              repeat(seq('\\', $.php_identifier)),
            ),
            $.namespace,
          )
        ),
      ),
      optional('\\'),
      field('class', alias($.php_identifier, $.class)),
    ),

    php_identifier: $ => /[A-Za-z][A-Za-z0-9_]*/,
    class_name: $ => /[A-Za-z][A-Za-z0-9_]*/,
  },
});
