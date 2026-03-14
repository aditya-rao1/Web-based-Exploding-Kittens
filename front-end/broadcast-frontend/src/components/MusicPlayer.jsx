
import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

 

function Player() {
    // const [isOpen, setIsOpen] = useState(false)
    const [file, setFile] = useState(null)


    const handleFileChange = (event) => {
        setFile(event.target.files[0])
    }
    const uploadFile = () => {
        // Logic to handle file upload
        // Reach out to mp3 api upload
        console.log("File uploaded: ", file)
    }

    const downloadBytes = (file) => {
        //download the bytes of the mp3
    }

    const broadcastAudio = (bytes) => {
        //broadcast the audio to all connected clients using web socket endpoint
    }

    return (
    <div>
        <h2>
            Media Uploader
        </h2>
        <input type="file" onChange={handleFileChange}/>
        <button onClick={uploadFile}>
            UploadFile
        </button>
    </div>
    )
}
export default Player