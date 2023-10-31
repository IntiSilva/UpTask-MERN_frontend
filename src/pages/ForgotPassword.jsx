import { useState } from 'react'
import { Link } from 'react-router-dom'
import axiosClient from '../config/axiosClient'
import Alert from '../components/Alert'

const ForgotPassword = () => {

    const [email, setEmail] = useState('')
    const [alert, setAlert] = useState({})

    const handleSubmit = async e => {
        e.preventDefault();

        if(email === '' || email.length < 6) {
            setAlert({
                msg: 'An Email is required',
                error: true
            });
            return
        }

        try {
            const { data } = await axiosClient.post(`/users/forgot-password`, { email })

            setAlert({
                msg: data.msg,
                error: false
            })

        } catch (error) {
            setAlert({
                msg: error.response.data.msg,
                error: true
            })
        }


    }

    const { msg } = alert

    return (
        <>
            <h1 className="text-sky-600 font-black text-6xl capitalize">Restore your access and don&apos;t lose your {''}
                <span className="text-slate-700">projects</span>
            </h1>

            { msg && <Alert alert={alert} />}

            <form
                className="my-10 bg-white shadow rounded-lg p-10"
                onSubmit={handleSubmit}
            >


                <div className="my-5">
                    <label
                        className="uppercase text-gray-600 block text-xl font-bold"
                        htmlFor="email"
                    >Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Register Email"
                        className="w-full mt-3 p-3 border rounded-xl bg-gray-50"
                        value={email}
                        onChange={ e => setEmail(e.target.value)}
                    />
                </div>


                <input
                    type="submit"
                    value="Send Instructions"
                    className="bg-sky-700 mb-5 w-full py-3 text-white uppercase font-bold rounded hover:cursor-pointer hover:bg-sky-800 transition-colors"
                />

            </form>

            <nav className="lg:flex lg:justify-between">
                <Link
                    className='block text-center my-5 text-slate-500 uppercase text-sm'
                    to="/"
                >Already have an account? Log in</Link>

                <Link
                    className='block text-center my-5 text-slate-500 uppercase text-sm'
                    to="/registrar"
                >Don&apos;t have and account? Register Here</Link>
            </nav>

        </>
    )
}

export default ForgotPassword