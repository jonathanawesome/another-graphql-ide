import { inputClass } from './input.css'

export type InputProps = {
  text: string
}

export const Input = ({ text }: InputProps) => {
  return <div className={inputClass}>{text}</div>
}
