export const initialCodeExample = `//INITIAL PROGRAM INTRO
//The following is just a base example to check if an input has an even/odd
//number of 1s in it. The machine will 'halt' once it's reached the end of
//input instructions for a state on an input (so, once there's no more moves).
//Tape (at end) will be 0 if even, and 1 if odd.

//Hit the 'examples' dropdown in the corner to see some more example programs.

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
odd _ 1 l halt`;
