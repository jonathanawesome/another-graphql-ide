import { inputStyles } from './input.css'

export type InputProps = {
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  isDisabled?: boolean
  name: string
  placeholder: string
  value: string
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
        onChange={e => handleChange(e)}
        placeholder={placeholder}
        type="text"
        value={value}
      />
    </div>
  )
}
