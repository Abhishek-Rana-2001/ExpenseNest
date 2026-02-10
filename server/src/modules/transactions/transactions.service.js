import { Transaction } from "./transactions.model.js"

export async function listTransactions() {
  // TODO: replace with Mongo query
  return []
}

export async function createTransaction(_input) {
  // TODO: replace with Mongo insert

  const newTransaction = await Transaction.create(_input)
  return newTransaction
}

