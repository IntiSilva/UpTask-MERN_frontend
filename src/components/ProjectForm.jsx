import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import useProjects from '../hooks/useProjects'
import Alert from './Alert'

const ProjectForm = () => {
    const [id, setId] = useState(null)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [client, setClient] = useState('')

    const params = useParams();
    const { showAlert, alert, submitProject, project } = useProjects();

    useEffect(() => {
        if( params.id ) {
            setId(project._id)
            setName(project.name)
            setDescription(project.description)
            setDueDate(project.dueDate?.split('T')[0])
            setClient(project.client)
        } 
    }, [params])


    const handleSubmit = async e => {
        e.preventDefault();

        if([name, description, dueDate, client].includes('') ) {
            showAlert({
                msg: 'All fields are required',
                error: true
            })

            return
        }

        // Give data to the provider
        await submitProject({ id, name, description, dueDate, client})

        setId(null)
        setName('')
        setDescription('')
        setDueDate('')
        setClient('')
    }

    const { msg } = alert

    return (
            <form
                className="bg-white py-10 px-5 md:w-1/2 rounded-lg shadow"
                onSubmit={handleSubmit}
            >
                    {msg && <Alert alert={alert} />}

                    <div className='mb-5'>
                        <label
                            className="text-gray-700 uppercase font-bold text-sm"
                            htmlFor="name"
                        >Project's Name</label>

                        <input
                            id="name"
                            type="text"
                            className="border w-full p-2 mt-2 placeholder-gray-400 rounded-md"
                            placeholder="Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div className='mb-5'>
                        <label
                            className="text-gray-700 uppercase font-bold text-sm"
                            htmlFor="description"
                        >Description</label>

                        <textarea
                            id="description"
                            className="border w-full p-2 mt-2 placeholder-gray-400 rounded-md"
                            placeholder="Project&apos;s Description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <div className='mb-5'>
                        <label
                            className="text-gray-700 uppercase font-bold text-sm"
                            htmlFor="due-date"
                        >Due Date</label>

                        <input
                            id="due-date"
                            type="date"
                            className="border w-full p-2 mt-2 placeholder-gray-400 rounded-md"
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                        />
                    </div>

                    <div className='mb-5'>
                        <label
                            className="text-gray-700 uppercase font-bold text-sm"
                            htmlFor="client"
                        >Client's Name</label>

                        <input
                            id="client"
                            type="text"
                            className="border w-full p-2 mt-2 placeholder-gray-400 rounded-md"
                            placeholder="Name"
                            value={client}
                            onChange={e => setClient(e.target.value)}
                        />
                    </div>

                    <input
                        type="submit"
                        value={id ? 'Update Project': 'Create Project'}
                        className='bg-sky-600 w-full p-3 uppercase font-bold text-white rounded cursor-pointer hover:bg-sky-700 transition-colors'
                    />
            </form>
    )
}

export default ProjectForm