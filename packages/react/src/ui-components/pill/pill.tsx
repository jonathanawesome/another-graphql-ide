import { pillClass } from './pill.css'

export type PillProps = {
  text: string
}

export const Pill = ({ text }: PillProps) => {
  return <div className={pillClass}>{text}</div>
}
