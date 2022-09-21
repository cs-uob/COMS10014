ace.define('ace/mode/natural', (acequire, exports, module) => {
    const oop = acequire('ace/lib/oop');
    const TextMode = acequire('ace/mode/text').Mode;
    var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

    var NaturalHighlightRules = function() {
        var keywords = ("assume|discharge|rule");
        var rules = ("andI|andE1|andE2|orI1|orI2|orE|notI|notE|impI|impE|falsum|lem");
        var ops = ("and|or|not|imp");
        var mapper = this.createKeywordMapper({
            "string": rules,
            "keyword": keywords,
            "constant.language": ops,
        }, "identifier", true);
    
        this.$rules = {
            "start": [
                {
                    token: mapper,
                    regex: "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
                }
            ]
        };
    }
    oop.inherits(NaturalHighlightRules, TextHighlightRules);

    var Mode = function() {
        this.HighlightRules = NaturalHighlightRules;
    }
    oop.inherits(Mode, TextMode);

    exports.Mode = Mode;
});
