import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import useProjects from '../hooks/useProjects';
import useAdmin from '../hooks/useAdmin';
import ModalTaskForm from '../components/ModalTaskForm'
import ModalDeleteTask from '../components/ModalDeleteTask'
import ModalDeleteCollaborator from '../components/ModalDeleteCollaborator'
import Task from '../components/Task';
import Alert from '../components/Alert';
import Collaborator from '../components/Collaborator';
import io from 'socket.io-client'

let socket;

const Project = () => {
  const params = useParams();
  const { getProject, project, loading, handleModalTask, alert, submitProjectTask, deleteProjectTask, updateProjectTask, changeTaskState } = useProjects()

  const admin = useAdmin()


  useEffect( () => {
    getProject(params.id)
  }, [])

  useEffect(() => {
    socket = io(import.meta.env.VITE_BACKEND_URL)
    socket.emit('open project', params.id)
  }, [])

  useEffect(() => {
    const unSub = () => {
      socket.emit('close project', params.id);
      socket.off();
    };

    socket.on('added task', (newTask) => {
      if (newTask.project === project._id) {
        submitProjectTask(newTask);
      }
    });

    socket.on('deleted task', (deletedTask) => {
      if (deletedTask.project === project._id) {
        deleteProjectTask(deletedTask);
      }
    });

    socket.on('updated task', (updatedTask) => {
      if (updatedTask.project._id === project._id) {
        updateProjectTask(updatedTask);
      }
    });

    socket.on('new state', (newTaskState) => {
      if (newTaskState.project._id === project._id) {
        changeTaskState(newTaskState);
      }
    });

    return unSub;
  });

  const { name } = project
  if(loading) return 'Loading...'
  const { msg } = alert


  return  (
        <>
          <div className='flex justify-between'>
              <h1 className='font-black text-4xl'>{name}</h1>

            {admin && (
              <div className='flex items-center gap-2 text-gray-400 hover:text-black'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <Link
                  to={`/projects/edit/${params.id}`}
                  className='uppercase font-bold'
                >Edit</Link>
              </div>
            )}
          </div>

          {admin && (
            <button
              onClick={ handleModalTask }
              type='button'
              className='text-sm px-5 py-3 w-full md:w-auto rounded-lg uppercase font-bold bg-sky-400 text-white text-center mt-5 flex gap-2 items-center justify-center'
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              New Task
            </button>
          )}


            <p className='font-bold text-xl mt-10'>Project&apos;s Tasks</p>


            <div className='bg-white shadow mt-10 rounded-lg'>
                {project.tasks?.length ?
                  project.tasks?.map( task => (
                    <Task
                      key={task._id}
                      task={task}
                    />
                  )) :
                <p className='text-center my-5 p-10'>There&apos;s no tasks in this project</p>}
            </div>

            {admin && (
              <>
                <div className='flex items-center justify-between mt-10'>
                    <p className='font-bold text-xl'>Collaborators</p>
                    <Link
                      to={`/projects/new-collaborator/${project._id}`}
                      className='text-gray-400 hover:text-black uppercase font-bold'
                    >Add</Link>
                </div>

                <div className='bg-white shadow mt-10 rounded-lg'>
                    {project.collaborators?.length ?
                      project.collaborators?.map( collaborator => (
                          <Collaborator
                              key={collaborator._id}
                              collaborator={collaborator}
                          />
                      )) :
                    <p className='text-center my-5 p-10'>There&apos;s no collaborators in this project</p>}
                </div>
              </>
            )}



            <ModalTaskForm />
            <ModalDeleteTask />
            <ModalDeleteCollaborator />
        </>
    )

}

export default Project