import { inputStyles } from './input.css'

type ControlValue = string | string[] | boolean

type ControlData = {
  name: string
  value: ControlValue
}

export type HandleChangeSignature = ({ name, value }: ControlData) => void

type BaseControlProps = {
  handleChange: HandleChangeSignature
  isDisabled?: boolean
  name: string
  placeholder: string
  value: ControlValue
}

export type InputProps = BaseControlProps & {
  displayLabel?: boolean
  options?: never
}

export const Input = ({
  handleChange,
  isDisabled,
  name,
  placeholder,
  value,
}: InputProps) => {
  return (
    <div className={inputStyles.container}>
      <input
        className={inputStyles.input}
        autoComplete="off"
        disabled={isDisabled}
        id={name}
        name={name}
        onChange={e => {
          handleChange({
            name,
            value: e.target.value,
          })
        }}
        placeholder={placeholder}
        type="text"
        value={value as string}
      />
    </div>
  )
}
