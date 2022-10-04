import {
	deleteObject,
	getDownloadURL,
	ref,
	uploadBytes,
	uploadBytesResumable,
} from "firebase/storage"
import React, { useState } from "react"
import { firestore, storage } from "../firebase.config"
import { Ring } from "@uiball/loaders"

import { doc, setDoc } from "firebase/firestore"

const Form = () => {
	const [isLoading, setIsLoading] = useState(false)
	const [data, setData] = useState({ title: "", subject: "", imageURL: null })
	const [imagePreview, setImagePreview] = useState("")
	const [isNotice, setIsNotice] = useState({
		field: false,
		status: "",
		msg: "",
	})

	const handleDelete = () => {
		setImagePreview("")
	}

	const saveData = () => {
		try {
			if (!data.title || !data.subject || !data.imageURL) {
				notifications(true, "danger", "Isi semua kolom termasuk gambar")
			} else {
				setIsLoading(true)
				const storageRef = ref(
					storage,
					`images/${Date.now()}-${data.imageURL.name}`,
				)
				const uploadTask = uploadBytesResumable(storageRef, data.imageURL)
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
							setDoc(
								doc(firestore, "notes", `${Date.now()}`),
								{
									title: data.title,
									subject: data.subject,
									imageURL: downloadURL,
								},
								{
									merge: true,
								},
							)
							setIsLoading(false)
							notifications(true, "success", "Data berhasil di Upload")
							clearData()
						})
					},
				)
			}
		} catch (error) {
			console.log(error)
		}
	}

	const clearData = () => {
		setData({ title: "", subject: "", imageURL: "" })
		setImagePreview("")
	}

	const notifications = (field, status, msg) => {
		setIsNotice({ ...data, field, status, msg })
		setTimeout(() => {
			setIsNotice({ ...data, field: false })
		}, 4000)
	}

	const handleImage = (e) => {
		const imageFile = e.target.files[0]
		setData({ ...data, imageURL: imageFile })
		setImagePreview(URL.createObjectURL(imageFile))
	}

	return (
		<div className='w-full flex justify-center items-center py-10 z-10'>
			<div className='flex flex-col gap-4 p-4 rounded-lg drop-shadow-md border lg:w-[800px] w-full h-auto bg-white'>
				{isNotice.field && (
					<div
						className={`px-4 py-2 rounded-md text-center text-white ${
							isNotice.status === "danger" ? "bg-red-400" : "bg-blue-400"
						}`}>
						<p>{isNotice.msg}</p>
					</div>
				)}

				<div className='grid md:grid-cols-2 grid-cols-1 md:gap-4 gap-2'>
					<div className='flex flex-col gap-4 grow'>
						<div>
							<input
								type='text'
								placeholder='Title...'
								className='text-base px-4 py-2 focus:outline-none rounded-md w-full font-medium bg-gray-50'
								value={data.title}
								onChange={(e) => setData({ ...data, title: e.target.value })}
							/>
						</div>
						<div className='grow'>
							<textarea
								type='text'
								placeholder='Subject Text'
								className='text-base px-4 py-2 focus:outline-none rounded-md w-full font-medium bg-gray-50 h-full'
								value={data.subject}
								onChange={(e) => setData({ ...data, subject: e.target.value })}
							/>
						</div>
					</div>
					<label
						htmlFor='image'
						className='aspect-square w-full h-full rounded-md bg-gray-50 flex flex-col justify-center items-center gap-2 cursor-pointer relative text-gray-500z-10'>
						<>
							{!imagePreview ? (
								<div className='flex flex-col justify-center items-center'>
									<input
										type='file'
										accept='image/*'
										className='h-0 w-0'
										name='image'
										id='image'
										onChange={handleImage}
									/>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'
										strokeWidth={2}
										stroke='currentColor'
										className='w-8 h-8'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											d='M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5'
										/>
									</svg>
									<p className='text-gray-600 font-medium'>Upload Image</p>
								</div>
							) : (
								<div className='w-full h-full '>
									<img
										src={imagePreview}
										className='object-cover w-full h-full rounded-md'
										alt=''
									/>
									<div
										className='absolute top-3 right-3 h-8 w-8 flex justify-center items-center bg-white rounded-full hover:text-blue-600'
										onClick={handleDelete}>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											fill='none'
											viewBox='0 0 24 24'
											strokeWidth={1.5}
											stroke='currentColor'
											className='w-6 h-6'>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
											/>
										</svg>
									</div>
								</div>
							)}
						</>
					</label>
				</div>
				<button
					className={` w-full px-4 py-2 bg-sky-600 text-white rounded-md font-semibold flex gap-2 items-center justify-center ${
						isLoading ? "disabled:" : ""
					}`}
					onClick={saveData}>
					{isLoading ? (
						<>
							<Ring size={24} lineWeight={6} speed={2} color='white' />
						</>
					) : (
						<>
							<span>SEND</span>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={1.5}
								stroke='currentColor'
								className='w-6 h-6'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5'
								/>
							</svg>
						</>
					)}
				</button>
			</div>
		</div>
	)
}

export default Form
