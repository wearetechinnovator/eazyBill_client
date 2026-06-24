// Circular Progress indicator
const Loading = ({className}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="loader"></div>
    </div>
  )
}

export default Loading