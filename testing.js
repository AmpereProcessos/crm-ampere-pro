const comissao = {
  aplicavel: true,
  resultados: [
    {
      condicao: {
        aplicavel: true,
        tipo: 'INCLUI_LISTA',
        variavel: 'responsaveis',
        inclui: ['SDR'],
      },
      valor: 0.03,
    },
    {
      condicao: {
        aplicavel: false,
        tipo: null,
        variavel: null,
        inclui: null,
      },
      valor: 0.06,
    },
  ],
}

const responsibles = [
  { papel: 'SDR', nome: 'JOÃO' },
  { papel: 'VENDEDOR', nome: 'LUCAS' },
]

// const matchList = ['SDR', 'ANALISTA']

// const responsiblesStr = responsibles.map((r) => r.papel).join(',')

// console.log(responsiblesStr)

// console.log(matchList.some((r) => responsiblesStr.includes(r)))
// const array = ['apple', 'banana', 'lemon', 'mango']
// const result = array.flatMap((v, i) => array.slice(i + 1).map((w) => v + ' ' + w))
// function getAllCombinations(list) {
//   // Recursive function to get all subsets
//   function getSubsets(arr, index) {
//     if (index === arr.length) {
//       // Base case: return an array with an empty subset
//       return [[]]
//     } else {
//       // Recursive case: get subsets for the rest of the elements
//       const subsets = getSubsets(arr, index + 1)
//       const element = arr[index]
//       const moreSubsets = subsets.map((subset) => [element, ...subset])
//       // Combine the current element subsets with the existing ones
//       return subsets.concat(moreSubsets)
//     }
//   }

//   // Generate all subsets
//   const allSubsets = getSubsets(list, 0)

//   // Filter out the empty subset and return the result
//   return allSubsets.filter((subset) => subset.length > 0).sort((a, b) => a.length - b.length)
// }

// // Example usage:
// const inputList = ['VENDEDOR', 'SDR']
// const combinations = getAllCombinations(inputList)
// console.log(combinations.map((c) => c.join(' + ')))

const clientId = '31412412312412'
const opportunityId = null
const homologationId = null
const projectId = null

const clientParam = clientId ? `clientId=${clientId}` : null
const opportunityParam = opportunityId ? `opportunityId=${opportunityId}` : null
const homologationParam = homologationId ? `homologationId=${homologationId}` : null
const projectParam = projectId ? `projectId=${projectId}` : null

const param = [clientParam, opportunityParam, homologationParam, projectParam].filter((q) => !!q).join('&')
console.log(param)
