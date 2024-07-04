import { useState, useEffect } from 'react'
import personService from './services/persons'
import './index.css'

const Filter = ({value, onChange}) => {
  return (
    <div>filter shown with: <input value={value} onChange={onChange}/></div>
  )
}

const PersonForm = ({newName, newNumber, handleNewName, handleNewNumber, addPerson}) => {
  return (
    <form onSubmit={addPerson}>
      <div>name: <input value={newName} onChange={handleNewName}/></div>
      <div>number: <input value={newNumber} onChange={handleNewNumber}/></div>
      <div><button type="submit">add</button></div>
    </form>
  )
}

const Person = ({name, number, deletePerson}) => <p>{name} {number} <button onClick={deletePerson}>delete</button></p>

const Persons = ({persons, search, deletePerson}) => {
  return persons
    .filter(person => person.name.toLowerCase().includes(search.toLowerCase()))
    .map(person => (
      <Person 
        key={person.name} 
        name={person.name} 
        number={person.number} 
        deletePerson={() => deletePerson(person.id)}
      />
  ))
}

const Notification = ({ message }) => {
  if (message === null) {
    return null
  }
  return (
    <div className="notification">
      {message}
    </div>
  )
}

const ErrorMessage = ({ message }) => {
  if (message === null) {
    return null
  }
  return (
    <div className="error">
      {message}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [search, setSearch] = useState('')
  const [notification, setNotification] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)


  useEffect(() => {
    personService
    .getAll()
    .then(persons => {
      setPersons(persons)
    })
}, [])

  const addPerson = (event) => {
    event.preventDefault()
    const personObject = {name: newName, number: newNumber}
    if (persons.some(person => person.name === newName)) {
      if (confirm(`${newName} is already added to phonebook. Do you want to replace the old number with a new one?`)) {
        const id = persons.find(person => person.name === newName).id
        personService
        .update(id, personObject)
        .then(returnedPerson => {
          setPersons(persons.map(person => person.id !== id ? person : returnedPerson))
          setNewName("")
          setNewNumber("")
          setNotification(`${newName} changed`)
          setTimeout(() => {
            setNotification(null)
          }, 5000)
        })
        .catch(error => {
          setPersons(persons.filter(person => person.id !== id))
          setErrorMessage(`Person '${newName}' was already removed from server`)
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
        })
      }
    } else {
      personService
        .create(personObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          setNewName("")
          setNewNumber("")
          setNotification(`${newName} added`)
          setTimeout(() => {
            setNotification(null)
          }, 5000)
        })
        .catch(error => {
          setErrorMessage(error.response.data.error)
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
          console.log(error.response.data)
        })
      
    }
  }

  const deletePerson = id => {
    const personName = persons.find(person => person.id === id).name
    if (confirm(`Do you want to delete ${personName}?`)) {
      personService.deletion(id)
      setPersons(persons.filter(person => person.id !== id))
      setNotification(`${personName} deleted`)
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    }
  }

  const handleNewName = (event) => setNewName(event.target.value)
  const handleNewNumber = (event) => setNewNumber(event.target.value)
  const handleSearch = (event) => setSearch(event.target.value)

  return (
    <div>
      <h2>Phonebook</h2>
      <ErrorMessage message={errorMessage} />
      <Notification message={notification} />
      <Filter value={search} onChange={handleSearch}/>
      <h3>add a new</h3>
      <PersonForm 
      newName={newName} 
      handleNewName={handleNewName} 
      newNumber={newNumber} 
      handleNewNumber={handleNewNumber} 
      addPerson={addPerson}/>
      <h3>Numbers</h3>
      <Persons persons={persons} search={search} deletePerson={deletePerson}/>
    </div>
  )

}

export default App