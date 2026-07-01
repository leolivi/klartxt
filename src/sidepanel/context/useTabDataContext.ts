import { useContext } from "react"
import { TabDataContext } from "./TabDataContextValue"

export function useTabDataContext() {
  const context = useContext(TabDataContext)
  if (!context)
    throw new Error("useTabDataContext must be used inside TabDataProvider")
  return context
}
