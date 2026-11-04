export const commentPat = /(\/\/.*)/;
export const errorPat = /(.+ .+ .+ [lr\*] .+)|([a-z]+:[ ]*[a-z0-1]+)/
export const inputLinePat = /input:[ ]*([a-zA-Z0-9-]+)/;
export const inputPat = /([a-zA-Z0-9-]+)/;
export const instructionPat = /([a-zA-Z0-9_]+) ([a-zA-Z0-9_]) ([a-zA-Z0-9_]) ([lr\*]) ([a-zA-Z0-9_]+)/;
export const haltPat = /.*(halt|accept|reject).*/i;
