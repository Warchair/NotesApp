import Form from "./component/Form"
import Result from "./component/Result"

function App() {
	return (
		<div className='App '>
			<div className='w-full h-auto lg:px-28 md:px-10 px-5 lg:py-10 md:py-5 bg-gray-100 '>
				<Form />
				<Result />
			</div>
		</div>
	)
}

export default App
