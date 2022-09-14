import {
	collection,
	getDocs,
	doc,
	deleteDoc,
	updateDoc,
} from "firebase/firestore"
import {
	deleteObject,
	getDownloadURL,
	ref,
	uploadBytesResumable,
} from "firebase/storage"
import React, { useState, useEffect } from "react"
import { firestore, storage } from "../firebase.config"
import { JellyTriangle } from "@uiball/loaders"
import { Ring } from "@uiball/loaders"

const Result = () => {
	const notesCollectionsRef = collection(firestore, "notes")
	const [data, setData] = useState([])
	const [openEdit, setOpenEdit] = useState(false)
	const [isHidden, setIsHidden] = useState(false)
	const [detailData, setDetailData] = useState({
		title: "",
		subject: "",
		imageURL: "",
	})
	const [imagePreview, setImagePreview] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [newImage, setNewImage] = useState(null)

	useEffect(() => {
		const id = setInterval(() => {
			const getData = async () => {
				const Data = await getDocs(notesCollectionsRef)
				setData(Data.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
			}
			getData()
		}, 100)
		return () => clearInterval(id)
	}, [data])

	const handleEditImage = (e) => {
		const imageFile = e.target.files[0]
		setImagePreview(URL.createObjectURL(imageFile))
		setNewImage(imageFile)
	}

	const handleEditClick = (bool, item) => {
		if (bool === true) {
			setIsHidden(true)
			setTimeout(() => {
				setOpenEdit(bool)
				setImagePreview(item.imageURL)
				setDetailData(item)
			}, 50)
		} else {
			setOpenEdit(bool)
			setTimeout(() => {
				setIsHidden(false)
			}, 200)
		}
	}

	const handleClickDelete = (item) => {
		const imgRef = ref(storage, item.imageURL)
		const userDoc = doc(firestore, "notes", item.id)
		deleteDoc(userDoc)
		deleteObject(imgRef).then(() => {
			alert("data berhasil dihapus")
		})
	}

	const handleUpdateData = async (id) => {
		setIsLoading(true)
		if (imagePreview === detailData.imageURL) {
			const userDoc = doc(firestore, "notes", id)
			await updateDoc(userDoc, detailData)
			setIsLoading(false)
			setIsHidden(false)
		} else {
			const storageRef = ref(storage, `images/${Date.now()}-${newImage.name}`)
			const uploadTask = uploadBytesResumable(storageRef, newImage)
			uploadTask.on(
				"state_changed",
				(snapshot) => {
					const progress =
						(snapshot.bytesTransferred / snapshot.totalBytes) * 100
				},
				(error) => {
					console.log(error)
				},
				() => {
					getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
						const storageRef = ref(storage, detailData.imageURL)
						deleteObject(storageRef).then((error) => {
							console.log(error)
						})
						updateDoc(doc(firestore, "notes", id), {
							title: detailData.title,
							subject: detailData.subject,
							imageURL: downloadURL,
						})
						setIsLoading(false)
						setIsHidden(false)
					})
				},
			)
		}
	}

	return (
		<div className='py-10'>
			{/* edit data */}
			<div className={isHidden ? "block" : "hidden"}>
				<div
					className={`fixed flex justify-center items-center w-full h-full px-4 py-4 bg-black/30 top-0 left-0  transition-all duration-200 ease-out transform z-20 overflow-y-auto ${
						openEdit ? "opacity-1 " : "opacity-0"
					} `}>
					<div
						className={`px-4 py-4 bg-white flex flex-col gap-3 rounded-lg lg:w-[800px] w-full transition-all duration-300 ease-out transform ${
							openEdit ? "scale-100 opacity-1" : "scale-75 opacity-0"
						}`}>
						<div className='flex justify-between items-center'>
							<h6 className='font-semibold text-lg'>Edit</h6>
							<div
								className='cursor-pointer'
								onClick={() => handleEditClick(false)}>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 24 24'
									fill='currentColor'
									className='w-6 h-6'>
									<path
										fillRule='evenodd'
										d='M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z'
										clipRule='evenodd'
									/>
								</svg>
							</div>
						</div>
						<div className='w-full flex justify-center items-center'>
							<div className=' flex flex-col gap-4 w-full h-auto bg-white'>
								<div className='flex md:flex-row flex-col md:gap-4 gap-2'>
									<div className='flex flex-col gap-4 grow'>
										<div>
											<input
												type='text'
												placeholder='Title...'
												className='text-base px-4 py-2 focus:outline-none rounded-md w-full font-medium bg-gray-50'
												value={detailData.title}
												onChange={(e) =>
													setDetailData({
														...detailData,
														title: e.target.value,
													})
												}
											/>
										</div>
										<div className='grow'>
											<textarea
												type='text'
												placeholder='Subject Text'
												className='text-base px-4 py-2 focus:outline-none rounded-md w-full font-medium bg-gray-50 h-full'
												value={detailData.subject}
												onChange={(e) =>
													setDetailData({
														...detailData,
														subject: e.target.value,
													})
												}
											/>
										</div>
									</div>
									<div className='md:w-[300px] h-full w-full aspect-square rounded-md bg-gray-50 flex flex-col justify-center items-center gap-2 relative text-gray-500'>
										<>
											{!imagePreview ? (
												<JellyTriangle size={25} speed={1.75} color='gray' />
											) : (
												<div>
													<img
														src={imagePreview}
														className='bg-cover h-full w-full rounded-md'
														alt=''
													/>
													<label
														htmlFor='images'
														className='absolute top-3 right-3 h-8 w-8 flex justify-center items-center bg-white rounded-full hover:text-blue-600 cursor-pointer'
														onClick={handleEditImage}>
														<svg
															xmlns='http://www.w3.org/2000/svg'
															viewBox='0 0 24 24'
															fill='currentColor'
															className='w-6 h-6'>
															<path d='M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z' />
														</svg>
														<input
															type='file'
															accept='image/*'
															className='h-0 w-0'
															name='images'
															id='images'
															onChange={handleEditImage}
														/>
													</label>
												</div>
											)}
										</>
									</div>
								</div>
								<button
									className={` w-full px-4 py-2 bg-sky-600 text-white rounded-md font-semibold flex gap-2 items-center justify-center ${
										isLoading ? "disabled" : ""
									}`}
									onClick={() => handleUpdateData(detailData.id)}>
									{isLoading ? (
										<>
											{" "}
											<Ring
												size={24}
												lineWeight={6}
												speed={2}
												color='white'
											/>{" "}
										</>
									) : (
										<span>UPDATE</span>
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* all data */}
			<div className='grid  lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 px-4 py-4 '>
				{data.map((item, index) => {
					return (
						<div key={index} className='relative group drop-shadow-md'>
							<div className='w-full z-20 h-full aspect-square bg-black/60 absolute rounded-lg border overflow-y-auto scrollbar grayscale group-hover:scale-[1.02] bg-cover  transition-all duration-200 ease-out '>
								<div className='absolute top-0 text-white p-6 '>
									<p className='font-roboto font-semibold md:text-2xl xl'>
										{item.title}
									</p>
									<div className='h-[0.5px] w-full bg-white mt-1 my-2'></div>
									<p className=' font-Tiro font-light text-slate-100 '>
										{item.subject}
									</p>
								</div>
							</div>
							<div
								className='w-full h-full aspect-square bg-gray-700 relative rounded-lg border overflow-y-auto scrollbar bg-cover'
								style={{ backgroundImage: `url(${item.imageURL})` }}></div>
							<div className='absolute w-full bottom-0 hidden justify-between p-4 text-white group-hover:flex z-30'>
								<div
									className='cursor-pointer'
									onClick={() => handleClickDelete(item)}>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										viewBox='0 0 24 24'
										fill='currentColor'
										className='w-6 h-6'>
										<path
											fillRule='evenodd'
											d='M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z'
											clipRule='evenodd'
										/>
									</svg>
								</div>
								<div
									className='cursor-pointer'
									onClick={() => handleEditClick(true, item)}>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										viewBox='0 0 24 24'
										fill='currentColor'
										className='w-6 h-6'>
										<path d='M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z' />
									</svg>
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default Result
