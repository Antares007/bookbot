// @flow 
const {static_cast} = require('./src/utils/static_cast')

type args_t = (() => ({||}))
	& (string => ({|string: string|}))
	& ((string, string) => ({| string: [string, string]|}))
	& ((string, number) => ({| string: string, number: number |}))
	& ((string, boolean) => ({| string: string, boolean: boolean |}))
	& ((string, {}) => ({| string: string, object: {} |}))
	& ((...Array<{}>) => ({| object: Array<{}> |}))
	& ((string, mixed[]) => ({| string: string, array: mixed[] |}))
	& (Function => ({| function: Function |}))

const args = static_cast<args_t>((...args) => {
	const aob = {}
	for(let a of args){
		if (aob.hasOwnProperty(typeof a)){
			const oa = aob[typeof a]
			if (Array.isArray(oa))
				oa.push(a)
			else
				aob[typeof a] = [oa, a]
		} else
			aob[typeof a] = a
	}
	return aob
})

const mk = k => v=> args(k,v)
const n = mk('name')
const l = mk('lname')
const p = mk('parent')
const otar = args(n('archil'), l('bolkvadze'))
const archil = args(n('archil'), l('bolkvadze'), p(otar))
//console.log(args("", o=>{}, null, [], null,1,2,3,{},{'a':1}))
console.log(
	archil
)
