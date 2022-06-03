import {useState , useEffect ,useRef} from 'react'
import axios from 'axios'

const Home = () => {
    const [file , setFile ] = useState(null)
    const fileInputRef = useRef()
    const [uploadingError , setError] = useState(null)
    const [uploadedImage , setUpladedImage] = useState(null) 
    const allowed_files = ['image/png', 'image/jpeg'] 
    const [predictedImage , setPredictedImage] = useState(null)
    const openFilePicker = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };
    const handleChange = (e) => {
        const file = e.target.files[0] 
        if (file && allowed_files.includes(file.type)){
            setFile(file)
            setError(null) 
        }else {
            setError('un valid type') 
            setFile(null)
        }
        
    }
    useEffect( () => {
        
            if(!file) {
                setUpladedImage(null) ; 
                setPredictedImage(null)
    
            } 
            else if (file) {
                var binaryData = [];
                binaryData.push(file);
                const  imgUrl = window.URL.createObjectURL(new Blob(binaryData, {type: "application/zip"}))
                setUpladedImage(imgUrl)
                setPredictedImage(null)
            }


    } ,[file])
    const handleClick = () => {
        if (file) {
            document.getElementById("segment").disabled = true;
            document.getElementById("select").disabled = true;
            let formData = new FormData();
            formData.append("file", file); 
            axios({
                method: 'POST',
                url: 'http://localhost:8000/predict/',
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                responseType: "arraybuffer"
            })
            .then(response => {
                const  base64string = btoa(String.fromCharCode(...new Uint8Array(response.data)));
                const  contentType = response.headers['content-type']
                const src = "data:" + contentType + ";base64," + base64string; 
                setPredictedImage(src)
                document.getElementById("select").disabled = false;
                document.getElementById("segment").disabled = false;
            })

            .catch(error => {
                console.error(error);
            })






    
    }}
    
    return ( 
        <div>
            <h2>Image Segmention</h2>  
            
            <input className='uploder' type="file"
                ref={fileInputRef}
                onChange={handleChange} /> 
            <button className='select' id='select' onClick={openFilePicker}> select</button>
            <div className='row'>
                {uploadedImage &&  <div className={predictedImage ? 'column' : ''}> <img src ={uploadedImage} /> </div>}
                {predictedImage && <div className='column'><img src ={predictedImage} /></div>}
            </div>
            {uploadedImage && <button className='segment' id='segment'  onClick= {handleClick}>segment</button> }
        </div>
    );
}
export default Home;