# Parsing terms

How do you parse a term? The full answer is in your second-year unit COMS20007 Programming Languages and Computation, but here is a sketch for now.

First, a simplified example that ignores precedence - let's say we want to parse a string like \\(x \wedge T \vee y\\) into a term in propositional logic, ignoring precedence.

The algorithm goes something like this:

![building a parse tree](../images/building_tree.png)

You read 'tokens' (values, variables or operators) one at a time from left to right and build a tree according to these rules.

  1. If you have no tree yet:
     1. If you see a value or variable, make a tree with one node.
     2. If you see a negation, make a tree with one negation node and one dangling edge.
     3. If you see a \\(\wedge\\) or \\(\vee\\) operator, parsing fails (a string for a valid term cannot start with one of these).
  2. If you have a tree, and no dangling edge:
     1. If you see a value or variable, parsing fails (this means there were two values/variables in a row).
     2. If you see a negation, parsing fails (a negation cannot appear immediately _after_ a value).
     3. If you see a \\(\wedge\\) or \\(\vee\\) operator, make a new node for it, connect its left child to the root of the tree you have so far, and make its right edge dangling.
  3. If you have a dangling edge:
     1. If you see a value or a variable, add a node for it on the dangling edge.
     2. If you see a negation, add a node for it on the dangling edge; the negation node now has a new dangling edge itself.
     3. If you see a \\(\wedge\\) or \\(\vee\\) operator, parsing fails (this means there were two operators in a row).

With only a little extra work, we can parse bracketed terms, whether the brackets are necessary or not.

  4. If you see an opening bracket, put your current tree to one side, and start parsing a new tree. This means you now have at least two trees 'in progress'.
  5. If you see a closing bracket and you have more than one tree in progress, take the last tree, and try and connect its root to the previous tree as if it were a value node.
  6. If you see a closing bracket when there is only one tree in progress, or you finish parsing and there is stillmore than one tree in progress, then parsing fails (due to mismatched brackets).

For example on the string \\(T \wedge (T \vee F)\\):

![parsing with brackets](../images/building_bracket_tree.png)

But, we don't yet have a parser that can correctly parse \\(T \vee F \wedge F\\) as \\(T \vee (F \wedge F)\\) using the precedence rules.

## Grammars

Generally, to write a parser by hand, you first define a grammar for the language you want to parse, then build the parser based on that. In fact, the translation from grammar to parser is mechanical enough, if you do the grammar correctly, that a computer could do it - typically you would just write the grammar and then use a _parser generator_ to generate the parser code from that.

Remember the definition of terms in first-order logic:

  1. A node containing a value is a term.
  2. If X is a term, then a negation node with one child X is a term.
  3. If X and Y are terms, then an 'and' or 'or' node with the two children X and Y is a term.
  4. A node containing a variable is a term.

We could define a grammar like this, using 'neg' and 'and' and similar for the operators:

    TERM :: VALUE | neg TERM | TERM and TERM | TERM or TERM | VARIABLE

This reads: "a term is a value, or a negation operator followed by a term, or a term followed by an 'and' operator followed by a term, or a term followed by an 'or' operator followed by a term, or a variable.

For parsing terms with brackets, we need to add one more option:

    TERM :: ( TERM )

This reads: "a term can be an opening bracket, followed by a term, followed by a closing bracket".

A valid term is anything that you can produce from these rules. For example, the term \\(x \wedge (y \vee z)\\) can be built as follows:

  1. x is a variable, therefore a term.
  2. y is a variable, therefore a term.
  3. z is a variable, therefore a term.
  4. From 2. and 3., \\(y \vee z\\) is a term, using the 'or' rule.
  5. From 4., \\((y \vee z)\\) is a term, using the brackets rule.
  6. From 1. and 5., \\(x \wedge (y \vee z)\\) is a term, using the 'and' rule.

Unfortunately, these rules still let us parse \\(x \wedge y \vee z\\) without brackets the wrong way round.

## Grammars, again

Based on the rule that a string representing a term cannot have an operator with an unbracketed child of _lower_ precedence, we can rewrite the grammar as follows. We need three new types of term, `TERM1` that deals with 'not' operators (precedence 1), `TERM2` which deals with the precedence-2 operator 'and' and `TERM3` for 'or', which has precedence level 3. We also need to have a way in a rule to say "repeat any number of times", which we denote with square brackets and an asterisk: `a[b]*` means `a | ab | abb | abbb | ...`.

    TERM  :: [not]* TERM1
    TERM1 :: TERM2 [and TERM1]*
    TERM2 :: TERM3 [or TERM2]*
    TERM3 :: ( TERM )
    TERM3 :: VARIABLE
    TERM3 :: VALUE

This is a full grammar for our terms, to which we could easily add more levels for more operators. For example, the term \\(x \wedge y \vee z\\) can now only be parsed in one way:

    TERM -> 
    TERM1 -> 
    TERM2 and TERM1 -> 
    TERM3 and TERM1 -> 
    VARIABLE and TERM1 ->
    VARIABLE and TERM2 ->
    VARIABLE and TERM3 or TERM2 -> 
    VARIABLE and VARIABLE or TERM2 ->
    VARIABLE and VARIABLE or TERM3 ->
    VARIABLE and VARIABLE or VARIABLE

When you are building a syntax tree, whenever you develop an expression on the side of an operator, it becomes a child node. So in the change

    VARIABLE and TERM2 -> VARIABLE and TERM3 or TERM2

The `TERM2` we are developing is on the side of an 'and' we already have, and therefore its result - the 'or' - becomes the right child of the 'and'. This is the trick to make sure that we get the right syntax tree.

The rules translate to computer code roughly as follows:

  1. Start trying to parse a TERM.
  2. When you are parsing a TERM, as long as you see NOT operators, add them to the syntax tree (with a dangling edge). Once this is no longer possible, switch to parsing a TERM1.
  3. When you are parsing a TERM1, start by trying to parse a TERM2. If this succeeds, and the next thing in the string when it has succeeded is an AND operator, then make an AND node with the parsed TERM2 as its left child, and continue trying to parse another TERM1 as its right child.
  4. When you are parsing a TERM2, start by trying to parse a TERM3. If this succeeds, and the next thing in the string when it has succeeded is an OR operator, then make an OR node with the parsed TERM3 as its left child, and continue trying to parse another TERM2 as its right child.
  5. When you are parsing a TERM3,
    1. If you see an opening bracket, try and parse a TERM, then a closing bracket. If this succeeds, the term in the bracket becomes the result of parsing the TERM3.
    2. If you see a value, add a node for it to the tree at the current dangling edge (you will not be parsing a TERM3 in the first place unless there is one).
    2. If you see a variable, add a node for it to the tree at the current dangling edge.
