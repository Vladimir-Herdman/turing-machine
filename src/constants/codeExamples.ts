export const codeExamples: Record<string, string> = {
    "Initial Example": `//INITIAL PROGRAM - ODD NUMBER CHECKER
//The following is just a base example to check if an input has an even/odd
//number of 1s in it. The machine will 'halt' once it's reached a state with
//'halt'|'accept'|'reject' anywhere in the state name, or there are no more
//moves for an input and state.
//The tape will end up being 0 if even, and 1 if odd.

//Hit the 'examples' dropdown in the corner to see some more example programs,
//with different input and state options so you can see what's possible.

//Syntax: variable:value
//We'll declare our input and supporting variables in this text too.
input:100101

//Syntax: <current_state> <current_symbol> <new_symbol> <direction>                 <new_state>
//        <string>        <char>           <char>       <l, r, or '*' (don't move)> <string>
//The first state declared will always be considered the "starting" state of
//the program, and can be any string (without spaces in it). Use '_' underscores
//for spaces in <current_symbol> and new.
even 0 _ r even
even 1 _ r odd
even _ 0 l halt

odd 0 _ r odd
odd 1 _ r even
odd _ 1 l halt`,


    "Count Up": `//Increment a binary value up by 1 infinitely.

input: 0

//states
0 0 0 r 0
0 1 1 r 0
0 _ _ l 1

1 0 1 r 0
1 1 0 l 1
1 _ 1 r 0`,

    "Palindrome": `//Check if a given input is a palindrome over characters {a, b}.

input: abaaaaba

//states (consider q7 accept state, if it ends somewhere else, rejected)
q1 a _ r q2
q1 b _ r q5
q1 _ _ * q7 //remember, '*' means don't move.

q2 a a r q2
q2 b b r q2
q2 _ _ l q3

q3 a _ l q4
q3 _ _ * q7

q4 a a l q4
q4 b b l q4
q4 _ _ r q1

q5 a a r q5
q5 b b r q5
q5 _ _ l q6

q6 b _ l q4
q6 _ _ * q7
`,
} as const;
