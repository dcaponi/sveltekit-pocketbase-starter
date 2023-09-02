<script lang="ts">

    const resumeUrl = import.meta.env["VITE_RESUME_URL"]
    let jobDescription = "";

    interface HTMLInputEvent extends Event {
        target: HTMLInputElement & EventTarget;
    }
    const uploadFile = async (event: HTMLInputEvent) => {
        event.preventDefault();

        const fileInput = event.target;
        if (!fileInput.files || fileInput.files.length === 0) {
            console.error('No file selected');
            return;
        }

        const file = fileInput.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('resume', file);
            
            try {
                const response = await fetch(`${resumeUrl}/resume`, {
                    method: 'POST',
                    body: formData,
                    credentials: 'include',
                });
                
                if (response.ok) {
                    let d = await response.json()
                    console.log(d);
                } else {
                    console.error('Error uploading file');
                }
            } catch (error) {
                console.error('An error occurred:', error);
            }
        }
    }
    const tailorResume = async (event: SubmitEvent) => {
        event.preventDefault()
        try {
            const response = await fetch(`${resumeUrl}/job`, {
                method: 'POST',
                body: JSON.stringify({jobDescription}),
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                }
            });
            
            if (response.ok) {
                let d = await response.json()
                console.log(d);
            } else {
                console.error('Error sending job description');
            }
        } catch (error) {
            console.error("An error occurred:", error)
        }
    }
    
</script>

<label for="resume">Add Resume</label><br/>
<input type="file" placeholder="upload resume" accept=".pdf" id="resume" on:change={(e) => {uploadFile(e)}}/><br/>

<form on:submit={tailorResume}>
    <label for="job">Add Job Description</label><br/>
    <textarea rows="20" cols="50" bind:value={jobDescription}/><br/>
    <button type="submit">Tailor Resume</button>
</form>