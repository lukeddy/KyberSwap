import BigNumber from 'bignumber.js'
import supported_tokens from "../services/supported_tokens"
import constants from "../services/constants"
import { calculateRate, calculateDest, getToken } from "../utils/converter"

const initFormState = constants.INIT_EXCHANGE_FORM_STATE
const initState = {}

const exchangeForm = (state=initState, action) => {
  var id = action.meta
  var newState = {...state}
  var formState = state[id] || initFormState
  newState[id] = {...formState}
  switch (action.type) {
    case "ACCOUNT_SELECTED": {
      newState[id].selectedAccount = action.payload
      return newState
    }
    case "CROSS_SEND_SELECTED": {
      newState[id].isCrossSend = true
      return newState
    }
    case "CROSS_SEND_DESELECTED": {
      newState[id].isCrossSend = false
      return newState
    }
    case "SOURCE_TOKEN_SELECTED": {
      var token = getToken(action.payload)
      newState[id].sourceToken = token.address
      newState[id].sourceTokenSymbol = token.symbol
      return newState
    }
    case "DEST_TOKEN_SELECTED": {
      var token = getToken(action.payload)
      newState[id].destToken = token.address
      newState[id].destTokenSymbol = token.symbol
      return newState
    }
    case "SOURCE_AMOUNT_SPECIFIED": {
      var sourceAmount = action.payload
      var minAmount = calculateDest(
        sourceAmount, newState[id].minConversionRate).toString(10)
      newState[id].sourceAmount = action.payload
      newState[id].minDestAmount = minAmount
      return newState
    }
    case "MIN_AMOUNT_SPECIFIED": {
      var minAmount = action.payload
      var minRate = calculateRate(newState[id].sourceAmount, minAmount).toString(10)
      newState[id].minDestAmount = minAmount
      newState[id].minConversionRate = minRate
      return newState
    }
    case "RECIPIENT_SPECIFIED": {
      newState[id].destAddress = action.payload
      return newState
    }
    case "GAS_PRICE_SPECIFIED": {
      newState[id].gasPrice = action.payload
      return newState
    }
    case "GAS_SPECIFIED": {
      newState[id].gas = action.payload
      return newState
    }
    case "ERROR_THREW": {
      newState[id].errors = {...newState[id].errors, ...action.payload}
      return newState
    }
    case "EXCHANGE_FORM_EMPTIED": {
      var step = newState[id].step
      newState[id] = {...initFormState, step: step}
      return newState
    }
    case "EXCHANGE_FORM_RESET_STEP": {
      newState[id].step = 1
      return newState
    }
    case "EXCHANGE_FORM_NEXT_STEP": {
      newState[id].step = newState[id].step + 1
      return newState
    }
    case "EXCHANGE_FORM_PREVIOUS_STEP": {
      newState[id].step = newState[id].step - 1
      return newState
    }
    case "EXCHANGE_FORM_APPROVAL_TX_BROADCAST_PENDING": {
      newState[id].broadcasting = true
      newState[id].txHash = action.payload
      return newState
    }
    case "EXCHANGE_FORM_TX_BROADCAST_PENDING": {
      newState[id].broadcasting = true
      newState[id].txHash = action.payload
      return newState
    }
    case "EXCHANGE_FORM_TX_BROADCAST_FULFILLED": {
      newState[id].broadcasting = false
      newState[id].txHash = action.payload
      return newState
    }
    case "EXCHANGE_FORM_SUGGEST_RATE": {
      var minRate = action.payload.rate
      var minAmount, block, balance, rate
      if ((new BigNumber(minRate)).toNumber() == 0) {
        minAmount = 0
        block = 0
        balance = 0
        rate = 0
      } else {
        minAmount = calculateDest(newState[id].sourceAmount, minRate).toString(10)
        block = action.payload.expirationBlock
        rate = action.payload.rate
        balance = action.payload.balance
      }
      newState[id].minConversionRate = minRate
      newState[id].minDestAmount = minAmount
      newState[id].offeredRateBalance = balance
      newState[id].offeredRateExpiryBlock = block
      newState[id].offeredRate = rate
      return newState
    }
  }
  return state
}

export default exchangeForm

