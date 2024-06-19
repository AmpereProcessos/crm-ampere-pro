// const Equipments = require('./main.equipments.json')
const fs = require('fs/promises')

const oemPricesByModuleQty = [
  {
    min: 0,
    max: 12,
    price: 19.9,
  },
  {
    min: 13,
    max: 19,
    price: 18.91,
  },
  {
    min: 20,
    max: 29,
    price: 17.96,
  },
  {
    min: 30,
    max: 49,
    price: 17.06,
  },
  {
    min: 50,
    max: 79,
    price: 16.21,
  },
  {
    min: 80,
    max: 109,
    price: 15.4,
  },
  {
    min: 110,
    max: 149,
    price: 13.86,
  },
  {
    min: 150,
    max: 199,
    price: 12.47,
  },
  {
    min: 200,
    max: 299,
    price: 11.23,
  },
  {
    min: 300,
    max: 499,
    price: 10.1,
  },
  {
    min: 500,
    max: 2000,
    price: 9.09,
  },
]

const conditionsSimpleMaintaince = oemPricesByModuleQty.map((range) => {
  return {
    condicao: {
      tipo: 'INTERVALO_NÚMERICO',
      aplicavel: true,
      variavel: 'numModulos',
      entre: {
        minimo: range.min,
        maximo: range.max,
      },
    },
    faturavel: false,
    margemLucro: 0,
    formulaArr: ['[numModulos]', '*', `${range.price}`],
  }
})
const conditionsSunPlan = oemPricesByModuleQty.map((range) => {
  return {
    condicao: {
      tipo: 'INTERVALO_NÚMERICO',
      aplicavel: true,
      variavel: 'numModulos',
      entre: {
        minimo: range.min,
        maximo: range.max,
      },
    },
    faturavel: false,
    margemLucro: 0,
    formulaArr: ['[plan]', '+', '(', '[numModulos]', '*', `${range.price}`, ')', '*', '1.3'],
  }
})
const conditionsSunPlusPlan = oemPricesByModuleQty.map((range) => {
  return {
    condicao: {
      tipo: 'INTERVALO_NÚMERICO',
      aplicavel: true,
      variavel: 'numModulos',
      entre: {
        minimo: range.min,
        maximo: range.max,
      },
    },
    faturavel: false,
    margemLucro: 0,
    formulaArr: ['[plan]', '+', '(', '[numModulos]', '*', `${range.price}`, ')', '*', '1.5'],
  }
})
const conditionsSimpleMaintainceJSON = JSON.stringify(conditionsSimpleMaintaince)
const conditionsSunPlanJSON = JSON.stringify(conditionsSunPlan)
const conditionsSunPlusPlanJSON = JSON.stringify(conditionsSunPlusPlan)
// fs.writeFile('./conditions-oem-plus.json', conditionsJSON, 'utf8', function (err) {
//   if (err) {
//     return console.log(err)
//   }

//   console.log('The file was saved!')
// })
// fs.writeFile('./conditions-simple-maintaince.json', conditionsSimpleMaintainceJSON, 'utf8', function (err) {
//   if (err) {
//     return console.log(err)
//   }

//   console.log('The file was saved!')
// })
// fs.writeFile('./conditions-sun-plan.json', conditionsSunPlanJSON, 'utf8', function (err) {
//   if (err) {
//     return console.log(err)
//   }

//   console.log('The file was saved!')
// })

function getADiasModuleInfo(item) {
  const module = item
  const powerRegex = /(\d+)W/
  const powerMatch = module.match(powerRegex)
  let power = powerMatch ? Number(powerMatch[1]) : 0

  let manufacturer = module.slice(0, powerMatch?.index).trim()
  const modFotovPrefix = 'MOD. FOTOV.'
  if (manufacturer.startsWith(modFotovPrefix)) {
    manufacturer = manufacturer.slice(modFotovPrefix.length).trim()
  }

  return { manufacturer, power }
}

const processFlowReference = {}
