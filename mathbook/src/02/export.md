# Exporting terms

Given a term as a tree (or its equivalent in code in your favourite programming language, if you already have one), how do we export it as a string? The answer is recursion again, but the following rules do not work as intended – after reading the rules, you might want to stop reading further and see if you have spotted the problem.

  1. To export a node containing an integer, convert the integer to a string and return that.
  2. To export a negation node, first export its child to get a string `s`. Then return the string `(-s)` where you replace `s` with the child's string. 
In most programming languages you could write this as `"(-" + s + ")"` or similar, or even `"(-${s})"` if your language allows that kind of interpolation.
  3. To export an addition, subtraction, or multiplication node, first export both children to get strings `s` and `t`. Then return the string that consists of `s`, the operator sign \\(+\\), \\(-\\), or \\(\times\\) as appropriate, and `t`. (You could add spaces around the operator too if you prefer.)
  4. (If you are doing terms with variables, then to export a node containing a variable, return the name of that variable as a string.)

What is the problem here? 

The problem is that both the different trees at the top of the last page for the expressions \\((2+3) \times 5\\) and \\(2+(3 \times 5)\\) export to the same string \\(2+3 \times 5\\), so if you first export then parse again, in one of the cases you will get the wrong tree back. Remember, brackets are not properties of terms themselves, they are properties of a particular representation. Further, if you export, parse, then evaluate, in one case you will get a different answer to if you evaluated directly. That is clearly not acceptable.

We could fix this by insisting on fully bracketed terms everywhere by tweaking the last rule:

> 3'. To export an addition, subtraction, or multiplication node, first export both children to get strings `s` and `t`. Then return the string that consists of an opening bracket, `s`, the operator sign \\(+\\), \\(-\\), or \\(\times\\) as appropriate, `t`, then a closing bracket. 

This gets the strings \\(((2+3) \times 5)\\) and \\((2+(3 \times 5))\\) which can be parsed correctly, and that is fine if a computer is doing all the work, but as humans we don't want the effort of writing out unnecessary brackets. Programming languages like C can correctly deal with `a+b*c` so there must be a better solution, and there is.

Question: when are brackets necessary? Think about this for a moment.

## Precedence

The answer has to do with the precedence of operators. In normal mathematics, the precedence is something like

  1. multiplication and division
  2. addition and subtraction

with extra levels for exponentiation etc. to get you the full BODMAS.

_(In the C programming language, which has more operators like `||` and `++` and `>>=`, there are [15 different precedence levels](https://en.cppreference.com/w/c/language/operator_precedence). You can see that multiplication is still a level above addition so that normal arithmetic works as you expect it to.)_

In propositional logic, as you know from the slides we have these precedence levels:

  1. \\(\neg\\)
  2. \\(\wedge\\)
  3. \\(\vee\\)
  4. \\(\oplus\\)
  5. \\(\Rightarrow\\)
  6. \\(\Leftrightarrow\\)

All textbooks agree on the first three; some might differ on the last three, or omit these rules and rely on brackets.

When do we need brackets? The first answer is that we need brackets if _a node has a child of lower precedence than itself._ Consider again our first example of terms as trees:

![tree representation of two terms](../images/termtrees.png)

In term A on the left, the \\(\times\\) term has a \\(+\\) child of lower precedence, so we need the brackets or we would end up with the string for term B. Term B on the right is fine, the \\(+\\) term has a \\(\times\\) child of higher precedence which would be parsed correctly anyway. So our next attempt:

> 3''. To export an addition, subtraction, or multiplication node, first export both children to get strings `s` and `t`. If either of the children has lower precedence than the node itself, add brackets around its string - for example; `s = "(" + s + ")"`. Create the string `z` which is `s` followed by the correct operator followed by `t`.

We are not completely finished, however. Imagine terms A and B again where both the operator nodes are \\(+\\). Addition is associative, so both terms will _evaluate_ to the same value, but as terms the two are not identical. If you take the convention that addition is parsed left-first, that is `a+b+c` means `(a+b)+c` and not the other way round, then you need another clause saying you add brackets if you have an addition node whose right child is another addition node. The effect of this rule is that the addition-only variant of term B now gets the brackets, as `2+3+5` would be parsed as the addition-only variant of term A.

Programming languages care about this point: the [C language operator precedence table](https://en.cppreference.com/w/c/language/operator_precedence) has a column indicating which operators are parsed left-to-right or right-to-left when you see a term with two or more of them.

Further, subtraction is not associative, so `5-(3-2)` and `(5-3)-2` are not the same thing. What is `5-3-2`? According to the C convention, it is `(5-3)-2`, so the actual rule is that you need to add brackets if either

  1. A node has a child of lower precedence, or
  2. A node has a child of the same precedence that does not match the order in which it is parsed.

The last point means that an addition or subtraction node whose right child is another addition or subtraction node would need brackets around the child term, since these nodes are parsed left-to-right. This finally gets us a formal definition of exporting (and, along the way, a rule for exactly which brackets are necessary or not) that works for numbers, Boolean algebra, propositional logic, and most programming languages among other things.

_Special note on C: the `=` assignment operator has right-to-left precedence, and after assigning, it evaluates to the value on the left. This lets you write for example `a = b = 0;` which is parsed as `a = (b=0);` and evaluates as follows: set b to 0 (`b=0`), evaluate this node as the new value of b which is of course 0, then the remaining expression is `a=0` which sets a to 0 too. Although this is allowed, it is normally considered bad style, and you probably should not do it in your C programming unit. But you may find this syntax in open-source C code._
