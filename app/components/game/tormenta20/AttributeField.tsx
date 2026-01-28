import { AttrGoty } from '../../images/tormenta20/attr-goty'

type AttributeFieldProps = {
  label: string;
  value: number;
}

const AttributeField = ({label, value}: AttributeFieldProps) => {
  return (
    <div className="flex w-fit h-fit justify-center">
      <p className="mt-0.5 absolute text-lg font-bold">{label}</p>
      <div className="flex w-fit h-fit justify-center items-center">
        <AttrGoty />
        <span className="mt-3 absolute text-4xl">{value}</span>
      </div>
    </div>
  )
}

export default AttributeField