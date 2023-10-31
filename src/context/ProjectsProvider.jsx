import { useState, useEffect, createContext } from 'react'
import axiosClient from '../config/axiosClient'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import io from 'socket.io-client'

let socket;

const ProjectsContext = createContext();

const ProjectsProvider = ({children}) => {

    const [projects, setProjects] = useState([]);
    const [alert, setAlert] = useState({});
    const [project, setProject] = useState({});
    const [loading, setLoading] = useState(false);
    const [ modalTaskForm, setModalTaskForm ] = useState(false)
    const [ task, setTask] = useState({})
    const [ modalDeleteTask, setModalDeleteTask ] = useState(false)
    const [ collaborator, setCollaborator] = useState({})
    const [ modalDeleteCollaborator, setModalDeleteCollaborator] = useState(false)
    const [ searchBar, setSearchBar] = useState(false)

    const navigate = useNavigate();
    const { auth } = useAuth()

    useEffect(() => {
        const getProjects = async () => {
            try {
                const token = localStorage.getItem('token')
                if(!token) return


                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
                const { data } = await axiosClient('/projects', config)
                setProjects(data)
            } catch (error) {
                console.log(error)
            }
        }
        getProjects()
    }, [auth])

    useEffect(() => {
        socket = io(import.meta.env.VITE_BACKEND_URL)
    }, [])

    const showAlert = alert => {
        setAlert(alert)

        setTimeout(() => {
            setAlert({})
        }, 5000);
    }

    const submitProject = async project => {
        if(project.id) {
            await editProject(project)
        } else {
            await newProject(project)
        }
    }

    const editProject = async project => {
        try {
            const token = localStorage.getItem('token')
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await axiosClient.put(`/projects/${project.id}`, project, config)

            // Sync the state
            const updatedProjects = projects.map(projectState => projectState._id === data._id ? data : projectState)
            setProjects(updatedProjects)

            setAlert({
                msg: 'Project Updated Successfully',
                error: false
            })

            setTimeout(() => {
                setAlert({})
                navigate('/projects')
            }, 3000);
        } catch (error) {
            console.log(error)
        }
    }

    const newProject = async project => {
        try {
            const token = localStorage.getItem('token')
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await axiosClient.post('/projects', project, config)

            setProjects([...projects, data])

            setAlert({
                msg: 'Project Created Succesfully',
                error: false
            })

            setTimeout(() => {
                setAlert({})
                navigate('/projects')
            }, 3000);
        } catch (error) {
            console.log(error)
        }
    }

    const getProject = async id => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await axiosClient(`/projects/${id}`, config )
            setProject(data)
            setAlert({})
        } catch (error) {
            navigate('/projects')
            setAlert({
                msg: error.response.data.msg,
                error: true
            })
            setTimeout(() => {
                setAlert({})
            }, 3000);
        } finally {
            setLoading(false)
        }
    }

    const deleteProject = async id => {
        try {
            const token = localStorage.getItem('token')
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await axiosClient.delete(`/projects/${id}`, config)

            // Sync the state
            const updatedProjects = projects.filter(projectState => projectState._id !== id )
            setProjects(updatedProjects)

            setAlert({
                msg: data.msg,
                error: false
            })

            setTimeout(() => {
                setAlert({})
                navigate('/projects')
            }, 3000);
        } catch (error) {
            console.log(error)
        }
    }

    const handleModalTask = () => {
        setModalTaskForm(!modalTaskForm)
        setTask({})
    }

    const submitTask = async task => {
        if(task?.id) {
            await editTask(task)
        } else {
            await createTask(task)
        }
    }

    const createTask = async task => {
        try {
            const token = localStorage.getItem('token')
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await axiosClient.post('/tasks', task, config)

            setAlert({})
            setModalTaskForm(false)

            // SOCKET IO
            socket.emit('new task', data)
        } catch (error) {
            console.log(error)
        }
    }

    const editTask = async task => {
        try {
            const token = localStorage.getItem('token')
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await axiosClient.put(`/tasks/${task.id}`, task, config)

            setAlert({})
            setModalTaskForm(false)

            // SOCKET
            socket.emit('update task', data)
        } catch (error) {
            console.log(error)
        }
    }

    const handleModalEditTask = task => {
        setTask(task)
        setModalTaskForm(true)
    }

    const handleModalDeleteTask = task => {
        setTask(task)
        setModalDeleteTask(!modalDeleteTask)
    }

    const deleteTask = async () => {

        try {
            const token = localStorage.getItem('token')
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await axiosClient.delete(`/tasks/${task._id}`, config)
            setAlert({
                msg: data.msg,
                error: false
            })

            setModalDeleteTask(false)

            // SOCKET
            socket.emit('delete task', task)

            setTask({})
            setTimeout(() => {
                setAlert({})
            }, 3000 )

        } catch (error) {
            console.log(error)
        }
    }

    const submitCollaborator = async email => {

        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await axiosClient.post('/projects/collaborators', {email}, config)

            setCollaborator(data)
            setAlert({})
        } catch (error) {
            setAlert({
                msg: error.response.data.msg,
                error: true
            })
        } finally {
            setLoading(false)
        }
    }

    const addCollaborator = async email => {

        try {
            const token = localStorage.getItem('token')
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
            const { data } = await axiosClient.post(`/projects/collaborators/${project._id}`, email, config)

            setAlert({
                msg: data.msg,
                error: false
            })
            setCollaborator({})

            setTimeout(() => {
                setAlert({})
            }, 3000);

        } catch (error) {
           setAlert({
               msg: error.response.data.msg,
               error: true
           })
        }
    }

    const handleModalDeleteCollaborator = (collaborator) => {
        setModalDeleteCollaborator(!modalDeleteCollaborator)
        setCollaborator(collaborator)
    }

    const deleteCollaborator = async () => {
        try {
            const token = localStorage.getItem('token')
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
            const { data } = await axiosClient.post(`/projects/delete-collaborator/${project._id}`, { id: collaborator._id }, config)

            const updatedProject = {...project}

            updatedProject.collaborators = updatedProject.collaborators.filter(collaboratorState => collaboratorState._id !== collaborator._id )

            setProject(updatedProject)
            setAlert({
                msg: data.msg,
                error: false
            })
            setCollaborator({})
            setModalDeleteCollaborator(false)

            setTimeout(() => {
                setAlert({})
            }, 3000);

        } catch (error) {
            console.log(error.response)
        }
    }

    const completeTask = async id => {
        try {
            const token = localStorage.getItem('token')
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
            const { data } = await axiosClient.post(`/tasks/state/${id}`, {}, config)
            setTask({})
            setAlert({})

            // socket
            socket.emit('change state', data)

        } catch (error) {
            console.log(error.response)
        }

    }

    const handleSearchBar = () => {
        setSearchBar(!searchBar)
    }

    // Socket io
    const submitProjectTask = (task) => {
        const updatedProject = {...project}
        updatedProject.tasks = [...updatedProject.tasks, task]
        setProject(updatedProject)
    }
    const deleteProjectTask = task => {
        console.log(task)
        const updatedProject = {...project}
        updatedProject.tasks = updatedProject.tasks.filter(taskState => taskState._id !== task._id )
        console.log(updatedProject)
        setProject(updatedProject)
    }

    const updateProjectTask = task => {
        const updatedProject = {...project}
        updatedProject.tasks = updatedProject.tasks.map( taskState => taskState._id === task._id ? task : taskState )
        setProject(updatedProject)
    }
    const changeTaskState = task => {
        const updatedProject = {...project}
        updatedProject.tasks = updatedProject.tasks.map(taskState => taskState._id === task._id ? task : taskState)
        setProject(updatedProject)
    }

    const closeProjectsSession = () => {
        setProjects([])
        setProject({})
        setAlert({})

    }

    return (
        <ProjectsContext.Provider
            value={{
                projects,
                showAlert,
                alert,
                submitProject,
                getProject,
                project,
                loading,
                deleteProject,
                modalTaskForm,
                handleModalTask,
                submitTask,
                handleModalEditTask,
                task,
                modalDeleteTask,
                handleModalDeleteTask,
                deleteTask,
                submitCollaborator,
                collaborator,
                addCollaborator,
                handleModalDeleteCollaborator,
                modalDeleteCollaborator,
                deleteCollaborator,
                completeTask,
                searchBar,
                handleSearchBar,
                submitProjectTask,
                deleteProjectTask,
                updateProjectTask,
                changeTaskState,
                closeProjectsSession
            }}
        >{children}
        </ProjectsContext.Provider>
    )
}
export {
    ProjectsProvider
}

export default ProjectsContext