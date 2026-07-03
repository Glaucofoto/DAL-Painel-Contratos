export default function CardIndicador({ rotulo, valor, detalhe, destaque }) {
  return (
    <div
      className={`border p-4 ${
        destaque
          ? 'border-danger bg-danger-bg'
          : 'border-gray-200 bg-panel'
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {rotulo}
      </p>
      <p
        className={`mt-1 text-xl font-bold sm:text-2xl ${
          destaque ? 'text-danger' : 'text-primary'
        }`}
      >
        {valor}
      </p>
      {detalhe && <p className="mt-1 text-xs text-gray-500">{detalhe}</p>}
    </div>
  )
}
