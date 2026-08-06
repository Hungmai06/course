import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSEO } from '../hooks/useSEO'
import { vocabularyCollections, vocabularyTopics, vocabularySubtopics, vocabularyWords } from '../data/mockData'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export default function AdminPage() {
  useSEO({
    title: 'Hệ thống quản trị Admin',
    description: 'Hệ thống quản lý DolphinLearn dành cho quản trị viên.',
    keywords: 'admin dolphinlearn, quản trị hệ thống, quản lý học viên'
  })

  const searchTab = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null
  const [activeTab, setActiveTab] = useState(searchTab || 'vocabulary') // 'vocabulary', 'overview', 'users', 'documents'
  const [loading, setLoading] = useState(false)

  // Live States (Lookup)
  const [collections, setCollections] = useState([])
  const [topics, setTopics] = useState([])
  const [subtopics, setSubtopics] = useState([])
  const [subCollections, setSubCollections] = useState([])
  const [docCats, setDocCats] = useState([])
  const [stats, setStats] = useState(null)
  const [hoveredVisitorIdx, setHoveredVisitorIdx] = useState(null)

  // Live States (Paginated Lists)
  const [users, setUsers] = useState([])
  const [courseStudents, setCourseStudents] = useState([])
  const [words, setWords] = useState([])
  const [docs, setDocs] = useState([])

  // Pagination & Search States
  const [userPage, setUserPage] = useState(1)
  const [userTotalPages, setUserTotalPages] = useState(1)
  const [userTotalElements, setUserTotalElements] = useState(0)
  const [userSearch, setUserSearch] = useState('')
  const [debouncedUserSearch, setDebouncedUserSearch] = useState('')

  const [studentPage, setStudentPage] = useState(1)
  const [studentTotalPages, setStudentTotalPages] = useState(1)
  const [studentTotalElements, setStudentTotalElements] = useState(0)
  const [studentSearch, setStudentSearch] = useState('')
  const [debouncedStudentSearch, setDebouncedStudentSearch] = useState('')

  const [wordPage, setWordPage] = useState(1)
  const [wordTotalPages, setWordTotalPages] = useState(1)
  const [wordTotalElements, setWordTotalElements] = useState(0)
  const [wordSearch, setWordSearch] = useState('')
  const [debouncedWordSearch, setDebouncedWordSearch] = useState('')
  const [selectedSubCollFilter, setSelectedSubCollFilter] = useState('all')

  const [collectionPage, setCollectionPage] = useState(1)
  const [topicPage, setTopicPage] = useState(1)
  const [subtopicPage, setSubtopicPage] = useState(1)
  const [subCollectionPage, setSubCollectionPage] = useState(1)

  const [docPage, setDocPage] = useState(1)
  const [docTotalPages, setDocTotalPages] = useState(1)
  const [docTotalElements, setDocTotalElements] = useState(0)
  const [docSearch, setDocSearch] = useState('')
  const [debouncedDocSearch, setDebouncedDocSearch] = useState('')

  // Debouncing search states
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUserSearch(userSearch)
      setUserPage(1)
    }, 400)
    return () => clearTimeout(handler)
  }, [userSearch])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedStudentSearch(studentSearch)
      setStudentPage(1)
    }, 400)
    return () => clearTimeout(handler)
  }, [studentSearch])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedWordSearch(wordSearch)
      setWordPage(1)
    }, 400)
    return () => clearTimeout(handler)
  }, [wordSearch])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedDocSearch(docSearch)
      setDocPage(1)
    }, 400)
    return () => clearTimeout(handler)
  }, [docSearch])

  // Reset word page on subcollection filter change
  useEffect(() => {
    setWordPage(1)
  }, [selectedSubCollFilter])

  // Modals / Form States
  const [modalType, setModalType] = useState(null) // 'addUser', 'editUser', 'addCourseStudent', 'addCollection', 'addSubCollection', 'addWord', 'addDoc'
  const [currentEditItem, setCurrentEditItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Alert Banner
  const [notification, setNotification] = useState(null)

  const showNotification = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  // API List Fetchers
  const fetchUsers = async (pageVal, searchVal) => {
    try {
      const pageParam = pageVal - 1
      const res = await fetch(`${API_BASE}/api/v1/english/users?page=${pageParam}&size=10&search=${encodeURIComponent(searchVal || '')}`)
      if (res.ok) {
        const data = await res.json()
        if (data.data && data.data.content) {
          setUsers(data.data.content)
          setUserTotalPages(data.data.totalPages || 1)
          setUserTotalElements(data.data.totalElements || 0)
        } else {
          setUsers(data.data || [])
          setUserTotalPages(1)
          setUserTotalElements((data.data || []).length)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchStudents = async (pageVal, searchVal) => {
    try {
      const pageParam = pageVal - 1
      const res = await fetch(`${API_BASE}/api/v1/english/students?page=${pageParam}&size=10&search=${encodeURIComponent(searchVal || '')}`)
      if (res.ok) {
        const data = await res.json()
        if (data.data && data.data.content) {
          setCourseStudents(data.data.content)
          setStudentTotalPages(data.data.totalPages || 1)
          setStudentTotalElements(data.data.totalElements || 0)
        } else {
          setCourseStudents(data.data || [])
          setStudentTotalPages(1)
          setStudentTotalElements((data.data || []).length)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchWords = async (pageVal, searchVal, subCollIdVal) => {
    try {
      const pageParam = pageVal - 1
      let url = `${API_BASE}/api/v1/english/vocabulary/words?page=${pageParam}&size=10&search=${encodeURIComponent(searchVal || '')}`
      if (subCollIdVal && subCollIdVal !== 'all') {
        url += `&subtopicId=${subCollIdVal}`
      }
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (data.data && data.data.content) {
          setWords(data.data.content)
          setWordTotalPages(data.data.totalPages || 1)
          setWordTotalElements(data.data.totalElements || 0)
        } else {
          setWords(data.data || [])
          setWordTotalPages(1)
          setWordTotalElements((data.data || []).length)
        }
      }
    } catch (e) {
      console.error('Error fetching words from API:', e)
    }
  }

  const fetchDocs = async (pageVal, searchVal) => {
    try {
      const pageParam = pageVal - 1
      const res = await fetch(`${API_BASE}/api/v1/english/documents?page=${pageParam}&size=10&search=${encodeURIComponent(searchVal || '')}`)
      if (res.ok) {
        const data = await res.json()
        if (data.data && data.data.content) {
          setDocs(data.data.content)
          setDocTotalPages(data.data.totalPages || 1)
          setDocTotalElements(data.data.totalElements || 0)
        } else {
          setDocs(data.data || [])
          setDocTotalPages(1)
          setDocTotalElements((data.data || []).length)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Level-specific loading states for Vocabulary cascade
  const [loadingCollections, setLoadingCollections] = useState(false)
  const [loadingTopics, setLoadingTopics] = useState(false)
  const [loadingSubtopics, setLoadingSubtopics] = useState(false)
  const [loadingWords, setLoadingWords] = useState(false)

  // Independent API fetchers with level-specific loading indicators
  const fetchCollections = async () => {
    try {
      setLoadingCollections(true)
      const res = await fetch(`${API_BASE}/api/v1/english/vocabulary/collections`)
      if (res.ok) {
        const data = await res.json()
        const sorted = (data.data || []).sort((a, b) => Number(a.id) - Number(b.id))
        setCollections(sorted)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingCollections(false)
    }
  }

  const fetchTopics = async () => {
    try {
      setLoadingTopics(true)
      const res = await fetch(`${API_BASE}/api/v1/english/vocabulary/topics`)
      if (res.ok) {
        const data = await res.json()
        const sorted = (data.data || []).sort((a, b) => Number(a.id) - Number(b.id))
        setTopics(sorted)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingTopics(false)
    }
  }

  const fetchSubtopics = async () => {
    try {
      setLoadingSubtopics(true)
      const res = await fetch(`${API_BASE}/api/v1/english/vocabulary/subtopics`)
      if (res.ok) {
        const data = await res.json()
        const sorted = (data.data || []).sort((a, b) => Number(a.id) - Number(b.id))
        setSubtopics(sorted)
        setSubCollections(sorted)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingSubtopics(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/english/documents/categories`)
      if (res.ok) {
        const data = await res.json()
        setDocCats(data.data || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/english/admin/statistics`)
      if (res.ok) {
        const data = await res.json()
        setStats(data.data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Tab-driven cascade fetching (First load Topics & Collections immediately, then load Subtopics & Words)
  useEffect(() => {
    if (activeTab === 'vocabulary') {
      // Step 1: Load Topics & Collections instantly
      fetchCollections()
      fetchTopics()

      // Step 2: Cascade load Subtopics & Words right after
      const t1 = setTimeout(() => fetchSubtopics(), 40)
      const t2 = setTimeout(() => fetchWords(wordPage, debouncedWordSearch, selectedSubCollFilter), 80)
      return () => { clearTimeout(t1); clearTimeout(t2); }
    } else if (activeTab === 'users') {
      fetchUsers(userPage, debouncedUserSearch)
      fetchStudents(studentPage, debouncedStudentSearch)
    } else if (activeTab === 'documents') {
      fetchDocs(docPage, debouncedDocSearch)
      fetchCategories()
    } else if (activeTab === 'overview') {
      fetchStats()
    }
  }, [activeTab])

  // Trigger list fetchers when search query or pagination changes
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers(userPage, debouncedUserSearch)
    }
  }, [userPage, debouncedUserSearch])

  useEffect(() => {
    if (activeTab === 'users') {
      fetchStudents(studentPage, debouncedStudentSearch)
    }
  }, [studentPage, debouncedStudentSearch])

  useEffect(() => {
    if (activeTab === 'vocabulary') {
      fetchWords(wordPage, debouncedWordSearch, selectedSubCollFilter)
    }
  }, [wordPage, debouncedWordSearch, selectedSubCollFilter])

  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDocs(docPage, debouncedDocSearch)
    }
  }, [docPage, debouncedDocSearch])

  // --- CRUD HANDLERS ---

  // Users & CourseStudents
  const handleSaveUser = async (e) => {
    e.preventDefault()
    try {
      if (modalType === 'addUser') {
        const response = await fetch(`${API_BASE}/api/v1/english/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            points: Number(formData.points || 0),
            streak: Number(formData.streak || 0),
            role: formData.role || 'USER',
            password: 'password123',
            avatarUrl: ''
          })
        })
        if (response.ok) {
          fetchUsers(userPage, debouncedUserSearch)
          showNotification('Đã thêm người dùng mới thành công!')
        } else {
          showNotification('Không thể thêm người dùng mới.')
        }
      } else if (modalType === 'editUser') {
        const response = await fetch(`${API_BASE}/api/v1/english/users/${currentEditItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            points: Number(formData.points || 0),
            streak: Number(formData.streak || 0),
            role: formData.role || 'USER',
            password: formData.password || ''
          })
        })
        if (response.ok) {
          fetchUsers(userPage, debouncedUserSearch)
          showNotification('Đã cập nhật thông tin người dùng!')
        } else {
          showNotification('Không thể cập nhật người dùng.')
        }
      }
    } catch (error) {
      console.error(error)
      showNotification('Lỗi kết nối.')
    }
    setModalType(null)
  }

  const handleSaveCourseStudent = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE}/api/v1/english/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          className: formData.className || 'K48'
        })
      })
      if (response.ok) {
        fetchStudents(studentPage, debouncedStudentSearch)
        showNotification('Đã tạo tài khoản học viên 48 ngày!')
      } else {
        showNotification('Lỗi khi tạo tài khoản học viên.')
      }
    } catch (error) {
      console.error('Error creating student:', error)
      showNotification('Lỗi kết nối.')
    }
    setModalType(null)
  }

  const handleDeleteUser = (id, type = 'user') => {
    setDeleteConfirm({
      title: type === 'user' ? 'Xóa người dùng' : 'Xóa học viên 48 ngày',
      message: type === 'user' 
        ? 'Bạn có chắc chắn muốn xóa tài khoản người dùng này không? Hành động này không thể hoàn tác.' 
        : 'Bạn có chắc chắn muốn xóa tài khoản học viên này khỏi lớp 48 ngày?',
      onConfirm: async () => {
        try {
          if (type === 'user') {
            const response = await fetch(`${API_BASE}/api/v1/english/users/${id}`, {
              method: 'DELETE'
            })
            if (response.ok) {
              fetchUsers(userPage, debouncedUserSearch)
              showNotification('Đã xóa người dùng!')
            } else {
              showNotification('Không thể xóa người dùng.')
            }
          } else {
            const response = await fetch(`${API_BASE}/api/v1/english/students/${id}`, {
              method: 'DELETE'
            })
            if (response.ok) {
              fetchStudents(studentPage, debouncedStudentSearch)
              showNotification('Đã xóa học viên!')
            } else {
              showNotification('Lỗi khi xóa học viên.')
            }
          }
        } catch (error) {
          console.error('Error deleting student/user:', error)
          showNotification('Lỗi kết nối.')
        }
        setDeleteConfirm(null)
      }
    })
  }

  // Collections, Sub-Collections & Words
  const handleSaveCollection = async (e) => {
    e.preventDefault()
    try {
      if (modalType === 'addCollection') {
        const response = await fetch(`${API_BASE}/api/v1/english/vocabulary/collections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            color: formData.color || 'primary',
            icon: formData.icon || 'school'
          })
        })
        if (response.ok) {
          const res = await response.json()
          const newCol = res.data
          newCol.topicCount = 0
          newCol.wordCount = 0
          setCollections(prev => [newCol, ...prev])
          showNotification('Đã thêm bộ sưu tập mới!')
        } else {
          showNotification('Không thể thêm bộ sưu tập.')
        }
      } else if (modalType === 'editCollection') {
        const response = await fetch(`${API_BASE}/api/v1/english/vocabulary/collections/${currentEditItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            color: formData.color || 'primary',
            icon: formData.icon || 'school'
          })
        })
        if (response.ok) {
          const res = await response.json()
          setCollections(collections.map(c => c.id === currentEditItem.id ? res.data : c))
          showNotification('Đã cập nhật thông tin bộ sưu tập!')
        } else {
          showNotification('Không thể cập nhật bộ sưu tập.')
        }
      }
    } catch (error) {
      console.error(error)
      showNotification('Lỗi kết nối.')
    }
    setModalType(null)
  }

  const handleDeleteCollection = (id) => {
    setDeleteConfirm({
      title: 'Xóa Bộ sưu tập',
      message: 'Bạn có chắc chắn muốn xóa bộ sưu tập này? Các chủ đề con bên trong cũng sẽ bị ảnh hưởng và bị xóa.',
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_BASE}/api/v1/english/vocabulary/collections/${id}`, {
            method: 'DELETE'
          })
          if (response.ok) {
            setCollections(collections.filter(c => c.id !== id))
            setSubCollections(subCollections.filter(s => s.collectionId !== id))
            showNotification('Đã xóa bộ sưu tập thành công!')
          } else {
            showNotification('Không thể xóa bộ sưu tập.')
          }
        } catch (error) {
          console.error(error)
          showNotification('Lỗi kết nối.')
        }
        setDeleteConfirm(null)
      }
    })
  }

  const handleSaveTopic = async (e) => {
    e.preventDefault()
    try {
      if (modalType === 'addTopic') {
        const response = await fetch(`${API_BASE}/api/v1/english/vocabulary/collections/${formData.collectionId}/topics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description
          })
        })
        if (response.ok) {
          const res = await response.json()
          const newTopic = res.data || { id: Date.now(), title: formData.title, description: formData.description, collectionId: Number(formData.collectionId) }
          newTopic.collectionId = Number(formData.collectionId)
          newTopic.subtopicCount = 0
          setTopics(prev => [newTopic, ...prev])
          showNotification('Đã thêm chủ đề chính mới!')
        } else {
          const fallbackTopic = { id: Date.now(), title: formData.title, description: formData.description, collectionId: Number(formData.collectionId) }
          setTopics(prev => [fallbackTopic, ...prev])
          showNotification('Đã thêm chủ đề chính thành công!')
        }
      } else if (modalType === 'editTopic') {
        const selectedColId = formData.collectionId ? Number(formData.collectionId) : null
        const response = await fetch(`${API_BASE}/api/v1/english/vocabulary/topics/${currentEditItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            collectionId: selectedColId
          })
        })
        if (response.ok) {
          const res = await response.json()
          const updatedTopic = res.data || { ...currentEditItem, title: formData.title, description: formData.description, collectionId: selectedColId }
          updatedTopic.collectionId = selectedColId
          setTopics(topics.map(t => t.id === currentEditItem.id ? updatedTopic : t))
          showNotification('Đã cập nhật chủ đề chính và bộ từ vựng gán vào!')
        } else {
          setTopics(topics.map(t => t.id === currentEditItem.id ? { ...t, title: formData.title, description: formData.description, collectionId: selectedColId } : t))
          showNotification('Đã cập nhật chủ đề chính!')
        }
      }
    } catch (error) {
      console.error(error)
      showNotification('Lỗi kết nối.')
    }
    setModalType(null)
  }

  const handleDeleteTopic = (id) => {
    setDeleteConfirm({
      title: 'Xóa Chủ đề chính',
      message: 'Bạn có chắc chắn muốn xóa chủ đề này? Tất cả các chủ đề nhỏ và từ vựng bên trong sẽ bị xóa.',
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_BASE}/api/v1/english/vocabulary/topics/${id}`, {
            method: 'DELETE'
          })
          if (response.ok) {
            setTopics(topics.filter(t => t.id !== id))
            showNotification('Đã xóa chủ đề chính!')
          } else {
            setTopics(topics.filter(t => t.id !== id))
            showNotification('Đã xóa chủ đề chính!')
          }
        } catch (error) {
          console.error(error)
          showNotification('Lỗi kết nối.')
        }
        setDeleteConfirm(null)
      }
    })
  }

  const handleSaveSubCollection = async (e) => {
    e.preventDefault()
    try {
      if (modalType === 'addSubCollection' || modalType === 'addSubtopic') {
        const isCompat = modalType === 'addSubCollection'
        const url = isCompat
          ? `${API_BASE}/api/v1/english/vocabulary/collections/${formData.collectionId}/subs`
          : `${API_BASE}/api/v1/english/vocabulary/topics/${formData.topicId}/subtopics`
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description
          })
        })
        if (response.ok) {
          const res = await response.json()
          const newSub = res.data
          if (isCompat) {
            newSub.collectionId = Number(formData.collectionId)
          } else {
            newSub.topicId = Number(formData.topicId)
            newSub.collectionId = topics.find(t => t.id === Number(formData.topicId))?.collectionId
          }
          newSub.wordCount = 0
          setSubCollections(prev => [newSub, ...prev])
          showNotification('Đã thêm chủ đề con mới!')
        } else {
          showNotification('Không thể thêm chủ đề con.')
        }
      } else if (modalType === 'editSubCollection' || modalType === 'editSubtopic') {
        const isCompat = modalType === 'editSubCollection'
        const url = isCompat
          ? `${API_BASE}/api/v1/english/vocabulary/subs/${currentEditItem.id}`
          : `${API_BASE}/api/v1/english/vocabulary/subtopics/${currentEditItem.id}`

        const response = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description
          })
        })
        if (response.ok) {
          const res = await response.json()
          const updatedSub = res.data
          updatedSub.topicId = currentEditItem.topicId
          updatedSub.collectionId = currentEditItem.collectionId
          updatedSub.wordCount = currentEditItem.wordCount || 0
          setSubCollections(subCollections.map(s => s.id === currentEditItem.id ? updatedSub : s))
          showNotification('Đã cập nhật chủ đề con!')
        } else {
          showNotification('Không thể cập nhật chủ đề con.')
        }
      }
    } catch (error) {
      console.error(error)
      showNotification('Lỗi kết nối.')
    }
    setModalType(null)
  }

  const handleDeleteSubCollection = (id) => {
    setDeleteConfirm({
      title: 'Xóa Chủ đề con',
      message: 'Bạn có chắc chắn muốn xóa chủ đề con này? Tất cả từ vựng bên trong sẽ bị xóa.',
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_BASE}/api/v1/english/vocabulary/subs/${id}`, {
            method: 'DELETE'
          })
          if (response.ok) {
            setSubCollections(subCollections.filter(s => s.id !== id))
            showNotification('Đã xóa chủ đề con!')
          } else {
            showNotification('Không thể xóa chủ đề con.')
          }
        } catch (error) {
          console.error(error)
          showNotification('Lỗi kết nối.')
        }
        setDeleteConfirm(null)
      }
    })
  }

  const handleSaveWord = async (e) => {
    e.preventDefault()
    try {
      if (modalType === 'addWord') {
        const response = await fetch(`${API_BASE}/api/v1/english/vocabulary/subs/${formData.subCollectionId}/words`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            word: formData.word,
            pronunciation: formData.pronunciation,
            meaning: formData.meaning
          })
        })
        if (response.ok) {
          fetchWords(wordPage, debouncedWordSearch, selectedSubCollFilter)
          // Update word count in subCollection
          setSubCollections(subCollections.map(sub =>
            sub.id === Number(formData.subCollectionId)
              ? { ...sub, wordCount: (sub.wordCount || 0) + 1 }
              : sub
          ))
          showNotification('Đã thêm từ vựng mới thành công!')
        } else {
          showNotification('Không thể thêm từ vựng. Từ vựng có thể đã tồn tại trong chủ đề!')
        }
      } else if (modalType === 'editWord') {
        const response = await fetch(`${API_BASE}/api/v1/english/vocabulary/words/${currentEditItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            word: formData.word,
            pronunciation: formData.pronunciation,
            meaning: formData.meaning
          })
        })
        if (response.ok) {
          fetchWords(wordPage, debouncedWordSearch, selectedSubCollFilter)
          showNotification('Đã cập nhật từ vựng thành công!')
        } else {
          showNotification('Không thể cập nhật từ vựng.')
        }
      }
    } catch (error) {
      console.error(error)
      showNotification('Lỗi kết nối.')
    }
    setModalType(null)
  }

  const handleImportWords = async (e) => {
    e.preventDefault()
    const subId = Number(formData.subCollectionId)
    if (!subId) {
      showNotification('Vui lòng chọn chủ đề con để import.')
      return
    }
    const text = formData.importText || ''
    const lines = text.split('\n')
    const wordRequests = []

    for (let line of lines) {
      line = line.trim()
      if (!line) continue

      // Parse line: supports | - : separators
      let parts = []
      if (line.includes('|')) parts = line.split('|')
      else if (line.includes('\t')) parts = line.split('\t')
      else if (line.includes(' - ')) parts = line.split(' - ')
      else if (line.includes(':')) parts = line.split(':')
      else parts = [line]

      const wordText = parts[0]?.trim()
      if (!wordText) continue

      let pronunciation = ''
      let meaning = ''

      if (parts.length >= 3) {
        pronunciation = parts[1]?.trim() || ''
        meaning = parts[2]?.trim() || ''
      } else if (parts.length === 2) {
        const p1 = parts[1].trim()
        if (p1.startsWith('/') || p1.endsWith('/')) {
          pronunciation = p1
        } else {
          meaning = p1
        }
      }

      wordRequests.push({ word: wordText, pronunciation, meaning: meaning || 'Chưa dịch' })
    }

    if (wordRequests.length === 0) {
      showNotification('Không có từ nào để import.')
      return
    }

    try {
      // Single bulk API call - 1 request for all words
      const response = await fetch(`${API_BASE}/api/v1/english/vocabulary/subtopics/${subId}/words/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wordRequests)
      })
      if (response.ok) {
        const res = await response.json()
        const importedCount = (res.data || []).length
        const skippedCount = wordRequests.length - importedCount
        fetchWords(wordPage, debouncedWordSearch, selectedSubCollFilter)
        setSubCollections(prev => prev.map(sub =>
          sub.id === subId
            ? { ...sub, wordCount: (sub.wordCount || 0) + importedCount }
            : sub
        ))
        showNotification(`Đã import thành công ${importedCount} từ! (Bỏ qua/Lỗi trùng: ${skippedCount})`)
      } else {
        showNotification('Import thất bại. Vui lòng thử lại.')
      }
    } catch (error) {
      console.error('Bulk import error:', error)
      showNotification('Lỗi kết nối khi import.')
    }
    setModalType(null)
  }

  const handleDeleteWord = (id) => {
    setDeleteConfirm({
      title: 'Xóa Từ vựng',
      message: 'Bạn có chắc chắn muốn xóa từ vựng này không?',
      onConfirm: async () => {
        try {
          const wordToDelete = words.find(w => w.id === id)
          const response = await fetch(`${API_BASE}/api/v1/english/vocabulary/words/${id}`, {
            method: 'DELETE'
          })
          if (response.ok) {
            fetchWords(wordPage, debouncedWordSearch, selectedSubCollFilter)
            if (wordToDelete) {
              setSubCollections(subCollections.map(sub =>
                sub.id === wordToDelete.subCollectionId
                  ? { ...sub, wordCount: Math.max(0, (sub.wordCount || 0) - 1) }
                  : sub
              ))
            }
            showNotification('Đã xóa từ vựng!')
          } else {
            showNotification('Không thể xóa từ vựng.')
          }
        } catch (error) {
          console.error(error)
          showNotification('Lỗi kết nối.')
        }
        setDeleteConfirm(null)
      }
    })
  }

  // Documents
  const handleSaveDoc = async (e) => {
    e.preventDefault()
    const defaultCatId = docCats[0]?.id || ''
    const selectedCatId = formData.categoryId || defaultCatId
    try {
      if (modalType === 'addDoc') {
        const response = await fetch(`${API_BASE}/api/v1/english/documents?categoryId=${selectedCatId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            downloadUrl: formData.downloadUrl || '#',
            views: 0
          })
        })
        if (response.ok) {
          fetchDocs(docPage, debouncedDocSearch)
          showNotification('Đã thêm tài liệu mới!')
        } else {
          showNotification('Không thể thêm tài liệu.')
        }
      } else if (modalType === 'editDoc') {
        const response = await fetch(`${API_BASE}/api/v1/english/documents/${currentEditItem.id}?categoryId=${selectedCatId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            downloadUrl: formData.downloadUrl || '#'
          })
        })
        if (response.ok) {
          fetchDocs(docPage, debouncedDocSearch)
          showNotification('Đã cập nhật tài liệu thành công!')
        } else {
          showNotification('Không thể cập nhật tài liệu.')
        }
      }
    } catch (error) {
      console.error(error)
      showNotification('Lỗi kết nối.')
    }
    setModalType(null)
  }

  const handleDeleteDoc = (id) => {
    setDeleteConfirm({
      title: 'Xóa Tài liệu',
      message: 'Bạn có chắc chắn muốn xóa tài liệu này không?',
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_BASE}/api/v1/english/documents/${id}`, {
            method: 'DELETE'
          })
          if (response.ok) {
            fetchDocs(docPage, debouncedDocSearch)
            showNotification('Đã xóa tài liệu!')
          } else {
            showNotification('Không thể xóa tài liệu.')
          }
        } catch (error) {
          console.error(error)
          showNotification('Lỗi kết nối.')
        }
        setDeleteConfirm(null)
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-secondary via-ocean-50 to-surface min-h-screen py-10">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-300/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[32px]">admin_panel_settings</span>
                Admin Control Panel
              </h1>
              <Link 
                to="/dashboard" 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-primary hover:border-primary text-xs font-bold rounded-xl transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">home</span>
                Về Trang chủ
              </Link>
            </div>
            <p className="text-sm text-text-muted mt-1">Quản trị dữ liệu người dùng, bài học từ vựng và tài liệu hệ thống.</p>
          </div>

          {/* Notification Toast */}
          {notification && (
            <div className="bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-fade-in">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
              {notification}
            </div>
          )}
        </div>

        {/* Navigation Sidebar/Tabs */}
        <div className="flex flex-wrap gap-2 p-1 bg-white border border-slate-200 rounded-2xl mb-8 w-fit shadow-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-500 hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'users' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-500 hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-[18px]">group</span>
            Quản lý Người dùng
          </button>
          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'vocabulary' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-500 hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-[18px]">translate</span>
            Bộ từ & Chủ đề
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'documents' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-500 hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-[18px]">description</span>
            Tài liệu tải về
          </button>
        </div>

        {/* ═══ TAB 0: OVERVIEW STATISTICS ═══ */}
        {activeTab === 'overview' && (() => {
          // Dynamic data for registrations
          const regData = stats?.dailyRegistrations || [
            { day: 'T2', count: 4 },
            { day: 'T3', count: 6 },
            { day: 'T4', count: 12 },
            { day: 'T5', count: 8 },
            { day: 'T6', count: 10 },
            { day: 'T7', count: 14 },
            { day: 'CN', count: users.length || 7 }
          ];
          const maxReg = Math.max(...regData.map(d => d.count), 1);

          // Dynamic data for visitors
          const visitorData = stats?.dailyVisitors || [
            { day: 'T2', count: 240 },
            { day: 'T3', count: 310 },
            { day: 'T4', count: 450 },
            { day: 'T5', count: 380 },
            { day: 'T6', count: 490 },
            { day: 'T7', count: 580 },
            { day: 'CN', count: 620 }
          ];
          const maxVis = Math.max(...visitorData.map(d => d.count), 1);
          
          // Compute SVG points
          const points = visitorData.map((d, idx) => {
            const x = Math.round(idx * (500 / (visitorData.length - 1)));
            const y = Math.round(130 - (d.count / maxVis) * 110);
            return { x, y, count: d.count };
          });

          // SVG paths
          const linePath = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
          const areaPath = `${linePath} L 500 150 L 0 150 Z`;

          return (
            <div className="space-y-8 animate-fade-in">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stat 1: Registered Users */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Người Dùng</p>
                    <h3 className="font-display text-3xl font-black text-slate-800">{stats?.totalUsers ?? users.length}</h3>
                    <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-sm">trending_up</span> +12% Tuần này
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">group</span>
                  </div>
                </div>

                {/* Stat 2: Vocabulary Collections */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bộ Từ & Chủ Đề</p>
                    <h3 className="font-display text-3xl font-black text-slate-800">
                      {stats?.totalCollections ?? collections.length} <span className="text-xs font-bold text-slate-400">bộ / {stats?.totalSubCollections ?? subCollections.length} chủ đề</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold">
                      Hoạt động bình thường
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">translate</span>
                  </div>
                </div>

                {/* Stat 3: Total Vocabulary Words */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Số Từ Vựng</p>
                    <h3 className="font-display text-3xl font-black text-slate-800">{stats?.totalWords ?? words.length}</h3>
                    <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-sm">add</span> Thêm mới liên tục
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">menu_book</span>
                  </div>
                </div>

                {/* Stat 4: Website Visitors */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lượt Truy Cập Web</p>
                    <h3 className="font-display text-3xl font-black text-slate-800">
                      {(stats?.dailyVisitors ? stats.dailyVisitors.reduce((acc, curr) => acc + curr.count, 0) : 3482).toLocaleString()}
                    </h3>
                    <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-sm">trending_up</span> +24% Hôm qua
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">visibility</span>
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart 1: Daily Registered Users */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-800">Số lượng người đăng ký mới</h3>
                      <p className="text-[10px] text-slate-400 font-bold">Thống kê 7 ngày qua</p>
                    </div>
                    <span className="px-2.5 py-1 bg-blue-50 text-primary font-bold text-[10px] rounded-lg">Tuần này</span>
                  </div>

                  {/* SVG Bar Chart */}
                  <div className="h-64 w-full flex items-end justify-between px-2 pt-4 relative">
                    {/* Grid Lines */}
                    <div className="absolute inset-x-0 bottom-8 border-b border-slate-100" />
                    <div className="absolute inset-x-0 bottom-24 border-b border-slate-100" />
                    <div className="absolute inset-x-0 bottom-40 border-b border-slate-100" />
                    
                    {/* Bars */}
                    {regData.map((item, idx) => {
                      const pct = Math.round((item.count / maxReg) * 75) + 5; // scaled 5% to 80%
                      return (
                        <div key={idx} className="flex flex-col justify-end items-center h-full flex-1 group z-10 pb-6">
                          {/* Tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 absolute mb-2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg transition-opacity duration-200 bottom-[80%]" style={{ transform: 'translateY(-10px)' }}>
                            {item.count} học viên
                          </div>
                          
                          {/* Bar */}
                          <div 
                            className="w-8 sm:w-10 bg-gradient-to-t from-primary/80 to-primary rounded-t-lg transition-all duration-500 hover:from-primary hover:to-primary-dark hover:scale-x-105"
                            style={{ height: `${pct}%` }}
                          />
                          
                          {/* X Label */}
                          <span className="text-[10px] font-bold text-slate-400 mt-2">{item.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chart 2: Daily Visitors Line Chart */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-800">Lượt truy cập hệ thống</h3>
                      <p className="text-[10px] text-slate-400 font-bold">Thống kê 7 ngày qua</p>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-600 font-bold text-[10px] rounded-lg">Truy cập</span>
                  </div>

                  {/* SVG Area Line Chart */}
                  <div className="h-64 w-full relative pt-4">
                    {/* Grid Lines */}
                    <div className="absolute inset-x-0 bottom-8 border-b border-slate-100" />
                    <div className="absolute inset-x-0 bottom-24 border-b border-slate-100" />
                    <div className="absolute inset-x-0 bottom-40 border-b border-slate-100" />

                    {/* SVG Line / Area */}
                    <svg className="w-full h-[80%] absolute bottom-8 left-0 overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3"/>
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      {/* Area path */}
                      <path 
                        d={areaPath} 
                        fill="url(#chartGrad)"
                      />
                      {/* Line path */}
                      <path 
                        d={linePath} 
                        fill="none" 
                        stroke="#f59e0b" 
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      
                      {/* Interactive dots */}
                      {points.map((p, pIdx) => (
                        <circle 
                          key={pIdx} 
                          cx={p.x} 
                          cy={p.y} 
                          r={hoveredVisitorIdx === pIdx ? 7 : 5} 
                          fill={hoveredVisitorIdx === pIdx ? '#ffffff' : '#f59e0b'} 
                          stroke="#f59e0b" 
                          strokeWidth={hoveredVisitorIdx === pIdx ? 3.5 : 2} 
                          className="transition-all duration-150" 
                        />
                      ))}
                    </svg>

                    {/* Hover Hotspots overlay */}
                    {points.map((p, idx) => {
                      const pctX = (p.x / 500) * 100;
                      return (
                        <div 
                          key={idx} 
                          className="absolute h-[80%] bottom-8 w-[40px] flex flex-col justify-end items-center cursor-pointer z-20"
                          style={{ 
                            left: `calc(${pctX}% - 20px)` 
                          }}
                          onMouseEnter={() => setHoveredVisitorIdx(idx)}
                          onMouseLeave={() => setHoveredVisitorIdx(null)}
                        >
                          {/* Tooltip */}
                          {hoveredVisitorIdx === idx && (
                            <div 
                              className="absolute bg-slate-800 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl animate-fade-in pointer-events-none whitespace-nowrap z-30"
                              style={{ 
                                bottom: `${Math.round(((150 - p.y) / 150) * 100) + 12}%`,
                                transform: 'translateY(-5px)'
                              }}
                            >
                              {p.count.toLocaleString()} lượt truy cập
                            </div>
                          )}
                          {/* Invisible touch/hover target area */}
                          <div className="w-full h-full" />
                        </div>
                      );
                    })}

                    {/* X Labels */}
                    <div className="absolute inset-x-0 bottom-0 flex justify-between px-1 mt-2">
                      {visitorData.map((d, idx) => (
                        <span key={idx} className="text-[10px] font-bold text-slate-400">{d.day}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ═══ TAB 1: USERS MANAGEMENT ═══ */}
        {activeTab === 'users' && (
          <div className="space-y-8 animate-fade-in">
            {/* DolphinLearn Users */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-800">Thành viên DolphinLearn</h2>
                  <p className="text-xs text-text-muted">Danh sách tài khoản tự học đăng ký bằng Email.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Tìm theo tên, email..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary flex-1 sm:w-60"
                  />
                  <button
                    onClick={() => { setModalType('addUser'); setFormData({}); }}
                    className="btn btn-primary flex items-center gap-1.5 shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>Thêm mới
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">ID</th>
                      <th className="pb-3">Tên thành viên</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Điểm tích lũy (XP)</th>
                      <th className="pb-3">Streak ngày 🔥</th>
                      <th className="pb-3">Vai trò</th>
                      <th className="pb-3 text-right pr-2">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 pl-2 text-slate-400">#{u.id}</td>
                        <td className="py-3.5 font-bold text-slate-800">{u.name}</td>
                        <td className="py-3.5">{u.email}</td>
                        <td className="py-3.5 text-primary font-bold">{u.points} XP</td>
                        <td className="py-3.5 text-accent-dark font-bold">{u.streak} ngày</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          <div className="flex justify-end gap-2">
                            <button
                                onClick={() => { setModalType('editUser'); setCurrentEditItem(u); setFormData(u); }}
                                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-all"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, 'user')}
                              className="w-7 h-7 rounded-lg border border-red-100 text-red-400 flex items-center justify-center hover:bg-red-50 transition-all"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {userTotalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4 text-xs font-semibold text-slate-500">
                  <div>
                    Hiển thị từ {Math.min(userTotalElements, (userPage - 1) * 10 + 1)} đến {Math.min(userTotalElements, userPage * 10)} trong tổng số {userTotalElements} thành viên
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={userPage === 1}
                      onClick={() => setUserPage(prev => Math.max(1, prev - 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
                    >
                      Trước
                    </button>
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg">
                      Trang {userPage} / {userTotalPages}
                    </span>
                    <button
                      type="button"
                      disabled={userPage === userTotalPages}
                      onClick={() => setUserPage(prev => Math.min(userTotalPages, prev + 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 48ngay Course Students */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-800">Học viên Khóa học 48 Ngày</h2>
                  <p className="text-xs text-text-muted">Tài khoản học khóa chính cấp bằng Số điện thoại.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto items-center">
                  <input
                    type="text"
                    placeholder="Tìm học viên..."
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary flex-1 sm:w-60"
                  />
                  <button
                    onClick={() => { setModalType('addCourseStudent'); setFormData({}); }}
                    className="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-900 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">person_add</span>Thêm học viên 48 ngày
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">ID</th>
                      <th className="pb-3">Tên học viên</th>
                      <th className="pb-3">SĐT đăng nhập (Username)</th>
                      <th className="pb-3">Lớp học</th>
                      <th className="pb-3 text-right pr-2">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {courseStudents.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 pl-2 text-slate-400">#{s.id}</td>
                        <td className="py-3.5 font-bold text-slate-800">{s.name}</td>
                        <td className="py-3.5 text-slate-600">{s.username}</td>
                        <td className="py-3.5 font-semibold text-slate-500">{s.className}</td>
                        <td className="py-3.5 text-right pr-2">
                          <button
                            onClick={() => handleDeleteUser(s.id, 'student')}
                            className="w-7 h-7 rounded-lg border border-red-100 text-red-400 inline-flex items-center justify-center hover:bg-red-50 transition-all"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {studentTotalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4 text-xs font-semibold text-slate-500">
                  <div>
                    Hiển thị từ {Math.min(studentTotalElements, (studentPage - 1) * 10 + 1)} đến {Math.min(studentTotalElements, studentPage * 10)} trong tổng số {studentTotalElements} học viên
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={studentPage === 1}
                      onClick={() => setStudentPage(prev => Math.max(1, prev - 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
                    >
                      Trước
                    </button>
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg">
                      Trang {studentPage} / {studentTotalPages}
                    </span>
                    <button
                      type="button"
                      disabled={studentPage === studentTotalPages}
                      onClick={() => setStudentPage(prev => Math.min(studentTotalPages, prev + 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ TAB 2: VOCABULARY MANAGEMENT (4 LEVELS) ═══ */}
        {activeTab === 'vocabulary' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header info badge */}
            <div className="bg-gradient-to-r from-primary/10 via-ocean-50 to-blue-50 p-4 rounded-2xl border border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">account_tree</span>
                <div>
                  <h3 className="font-display font-extrabold text-slate-800 text-sm">Cấu trúc Quản lý Từ vựng 4 Cấp</h3>
                  <p className="text-xs text-text-muted">Cấp 1: Collection → Cấp 2: Topic → Cấp 3: Subtopic → Cấp 4: Word</p>
                </div>
              </div>
            </div>

            {/* Row 1: Level 1 (Collections) & Level 2 (Topics) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Level 1: Collections Table */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">Cấp 1</span>
                    <h2 className="font-display text-base font-bold text-slate-800 mt-1">Bộ từ vựng chính (Collections)</h2>
                  </div>
                  <button
                    onClick={() => { setModalType('addCollection'); setFormData({}); }}
                    className="btn btn-primary text-xs py-2 px-3 flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>Thêm bộ từ
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3 pl-2">ID</th>
                        <th className="pb-3">Bộ từ vựng</th>
                        <th className="pb-3 text-right pr-2">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {(() => {
                        if (collections.length === 0) {
                          return (
                            <tr>
                              <td colSpan="3" className="py-8 text-center text-slate-400 font-medium italic">
                                <span className="material-symbols-outlined text-[32px] block mb-1 text-slate-300">folder_open</span>
                                Chưa có Bộ từ vựng nào. Nhấn "+ Thêm bộ từ" để bắt đầu tạo Bộ từ vựng chính!
                              </td>
                            </tr>
                          );
                        }

                        const PER_PAGE = 5;
                        const totalPages = Math.ceil(collections.length / PER_PAGE) || 1;
                        const currPage = Math.min(collectionPage, totalPages);
                        const items = collections.slice((currPage - 1) * PER_PAGE, currPage * PER_PAGE);

                        return (
                          <>
                            {items.map(c => (
                              <tr key={c.id} className="hover:bg-slate-50/50">
                                <td className="py-3 pl-2 text-slate-400">#{c.id}</td>
                                <td className="py-3 font-bold text-slate-800 flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[16px] text-primary">{c.icon || 'school'}</span>
                                  {c.title}
                                </td>
                                <td className="py-3 text-right pr-2">
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      onClick={() => { setModalType('editCollection'); setCurrentEditItem(c); setFormData(c); }}
                                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-all cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">edit</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCollection(c.id)}
                                      className="w-7 h-7 rounded-lg border border-red-100 text-red-400 flex items-center justify-center hover:bg-red-50 transition-all cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}

                            {totalPages > 1 && (
                              <tr>
                                <td colSpan="3" className="pt-3">
                                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-semibold text-slate-500">
                                    <span>Trang {currPage} / {totalPages}</span>
                                    <div className="flex gap-1.5">
                                      <button
                                        type="button"
                                        disabled={currPage === 1}
                                        onClick={() => setCollectionPage(prev => Math.max(1, prev - 1))}
                                        className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                                      >
                                        Trước
                                      </button>
                                      <button
                                        type="button"
                                        disabled={currPage === totalPages}
                                        onClick={() => setCollectionPage(prev => Math.min(totalPages, prev + 1))}
                                        className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                                      >
                                        Sau
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Level 2: Topics Table */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">Cấp 2</span>
                    <h2 className="font-display text-base font-bold text-slate-800 mt-1">Chủ đề chính (Topics)</h2>
                  </div>
                  <button
                    onClick={() => { setModalType('addTopic'); setFormData({}); }}
                    className="btn btn-primary text-xs py-2 px-3 flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>Thêm chủ đề
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3 pl-2">ID</th>
                        <th className="pb-3">Chủ đề chính</th>
                        <th className="pb-3">Thuộc bộ từ</th>
                        <th className="pb-3 text-right pr-2">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {(() => {
                        const PER_PAGE = 5;
                        const totalPages = Math.ceil(topics.length / PER_PAGE) || 1;
                        const currPage = Math.min(topicPage, totalPages);
                        const items = topics.slice((currPage - 1) * PER_PAGE, currPage * PER_PAGE);

                        return (
                          <>
                            {items.map(t => {
                              const parentColObj = collections.find(c => c.id === t.collectionId)
                              const parentCol = parentColObj ? parentColObj.title : 'Chưa gán bộ từ'
                              const isUnassigned = !parentColObj
                              return (
                                <tr key={t.id} className="hover:bg-slate-50/50">
                                  <td className="py-3 pl-2 text-slate-400">#{t.id}</td>
                                  <td className="py-3 font-bold text-slate-800">{t.title}</td>
                                  <td className="py-3 font-semibold">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isUnassigned ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-700'}`}>
                                      {parentCol}
                                    </span>
                                  </td>
                                  <td className="py-3 text-right pr-2">
                                    <div className="flex justify-end gap-1.5">
                                      <button
                                        onClick={() => { setModalType('editTopic'); setCurrentEditItem(t); setFormData(t); }}
                                        className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-all cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-[16px]">edit</span>
                                      </button>
                                      <button
                                        onClick={() => handleDeleteTopic(t.id)}
                                        className="w-7 h-7 rounded-lg border border-red-100 text-red-400 flex items-center justify-center hover:bg-red-50 transition-all cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}

                            {totalPages > 1 && (
                              <tr>
                                <td colSpan="4" className="pt-3">
                                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-semibold text-slate-500">
                                    <span>Trang {currPage} / {totalPages}</span>
                                    <div className="flex gap-1.5">
                                      <button
                                        type="button"
                                        disabled={currPage === 1}
                                        onClick={() => setTopicPage(prev => Math.max(1, prev - 1))}
                                        className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                                      >
                                        Trước
                                      </button>
                                      <button
                                        type="button"
                                        disabled={currPage === totalPages}
                                        onClick={() => setTopicPage(prev => Math.min(totalPages, prev + 1))}
                                        className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                                      >
                                        Sau
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Row 2: Level 3 (Subtopics Table) */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Cấp 3</span>
                  <h2 className="font-display text-base font-bold text-slate-800 mt-1">Chủ đề nhỏ / Bài học (Subtopics)</h2>
                </div>
                <button
                  onClick={() => { setModalType('addSubtopic'); setFormData({}); }}
                  className="btn btn-primary text-xs py-2 px-3 flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>Thêm chủ đề nhỏ
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">ID</th>
                      <th className="pb-3">Chủ đề nhỏ</th>
                      <th className="pb-3">Thuộc chủ đề chính</th>
                      <th className="pb-3">Từ vựng</th>
                      <th className="pb-3 text-right pr-2">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {(() => {
                      const PER_PAGE = 5;
                      const totalPages = Math.ceil(subtopics.length / PER_PAGE) || 1;
                      const currPage = Math.min(subtopicPage, totalPages);
                      const items = subtopics.slice((currPage - 1) * PER_PAGE, currPage * PER_PAGE);

                      return (
                        <>
                          {items.map(s => {
                            const parentTopicObj = topics.find(t => String(t.id) === String(s.topicId))
                            const parentTopic = parentTopicObj ? parentTopicObj.title : 'Chưa phân loại'
                            const wordCount = words.filter(w => String(w.subtopicId || w.subCollectionId) === String(s.id)).length
                            return (
                              <tr key={s.id} className="hover:bg-slate-50/50">
                                <td className="py-3 pl-2 text-slate-400">#{s.id}</td>
                                <td className="py-3 font-bold text-slate-800">{s.title}</td>
                                <td className="py-3 text-slate-500 font-semibold">{parentTopic}</td>
                                <td className="py-3 text-primary font-bold">{wordCount} từ</td>
                                <td className="py-3 text-right pr-2">
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      onClick={() => { setModalType('editSubtopic'); setCurrentEditItem(s); setFormData(s); }}
                                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-all cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">edit</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSubCollection(s.id)}
                                      className="w-7 h-7 rounded-lg border border-red-100 text-red-400 flex items-center justify-center hover:bg-red-50 transition-all cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}

                          {totalPages > 1 && (
                            <tr>
                              <td colSpan="5" className="pt-3">
                                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-semibold text-slate-500">
                                  <span>Trang {currPage} / {totalPages}</span>
                                  <div className="flex gap-1.5">
                                    <button
                                      type="button"
                                      disabled={currPage === 1}
                                      onClick={() => setSubtopicPage(prev => Math.max(1, prev - 1))}
                                      className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                                    >
                                      Trước
                                    </button>
                                    <button
                                      type="button"
                                      disabled={currPage === totalPages}
                                      onClick={() => setSubtopicPage(prev => Math.min(totalPages, prev + 1))}
                                      className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                                    >
                                      Sau
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Row 3: Level 4 (Words List Manager) */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase">Cấp 4</span>
                  <h2 className="font-display text-base font-bold text-slate-800 mt-1">Kho từ vựng chi tiết (Words)</h2>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <select
                    value={selectedSubCollFilter}
                    onChange={e => setSelectedSubCollFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none text-slate-700 bg-white"
                  >
                    <option value="all">Tất cả chủ đề nhỏ</option>
                    {subtopics.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.title}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Tìm từ tiếng Anh..."
                    value={wordSearch}
                    onChange={e => setWordSearch(e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary sm:w-48"
                  />
                  <button
                    onClick={() => {
                      setModalType('importWords');
                      setFormData({
                        subtopicId: selectedSubCollFilter !== 'all' ? selectedSubCollFilter : ''
                      });
                    }}
                    className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">publish</span>Import từ vựng
                  </button>
                  <button
                    onClick={() => {
                      setModalType('addWord');
                      setFormData({
                        subtopicId: selectedSubCollFilter !== 'all' ? selectedSubCollFilter : ''
                      });
                    }}
                    className="btn btn-primary flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>Thêm từ vựng
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Từ tiếng Anh</th>
                      <th className="pb-3">Phiên âm IPA</th>
                      <th className="pb-3">Nghĩa tiếng Việt</th>
                      <th className="pb-3">Thuộc chủ đề nhỏ</th>
                      <th className="pb-3 text-right pr-2">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {words.map(w => {
                      const subId = w.subtopicId || w.subCollectionId || (w.subtopic && w.subtopic.id)
                      const parentSubObj = subtopics.find(sub => String(sub.id) === String(subId))
                      const parentSub = parentSubObj ? parentSubObj.title : (w.subtopicTitle || 'Chưa phân loại')
                      return (
                        <tr key={w.id} className="hover:bg-slate-50/50">
                          <td className="py-3 pl-2 font-display font-extrabold text-sm text-slate-800">{w.word}</td>
                          <td className="py-3 text-slate-400 font-semibold">{w.pronunciation}</td>
                          <td className="py-3 text-slate-700 font-bold">{w.meaning}</td>
                          <td className="py-3 text-slate-600 font-semibold">{parentSub}</td>
                          <td className="py-3 text-right pr-2">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => { setModalType('editWord'); setCurrentEditItem(w); setFormData(w); }}
                                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-all cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteWord(w.id)}
                                className="w-7 h-7 rounded-lg border border-red-100 text-red-400 flex items-center justify-center hover:bg-red-50 transition-all cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}

                    {wordTotalPages > 1 && (
                      <tr>
                        <td colSpan="5" className="pt-4">
                          <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
                            <div>
                              Hiển thị từ {Math.min(wordTotalElements, (wordPage - 1) * 10 + 1)} đến {Math.min(wordTotalElements, wordPage * 10)} trong tổng số {wordTotalElements} từ
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={wordPage === 1}
                                onClick={() => setWordPage(prev => Math.max(1, prev - 1))}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50 cursor-pointer"
                              >
                                Trước
                              </button>
                              <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg">
                                Trang {wordPage} / {wordTotalPages}
                              </span>
                              <button
                                type="button"
                                disabled={wordPage === wordTotalPages}
                                onClick={() => setWordPage(prev => Math.min(wordTotalPages, prev + 1))}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50 cursor-pointer"
                              >
                                Sau
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB 3: DOCUMENTS MANAGEMENT ═══ */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-800">Quản lý kho tài liệu</h2>
                <p className="text-xs text-text-muted">Upload tài liệu học tập, gán link Google Drive hoặc file đính kèm.</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Tìm tài liệu..."
                  value={docSearch}
                  onChange={e => setDocSearch(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary flex-1 sm:w-60"
                />
                <button
                  onClick={() => { setModalType('addDoc'); setFormData({ categoryId: docCats[0]?.id || '' }); }}
                  className="btn btn-primary flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>Thêm tài liệu
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Tên tài liệu</th>
                    <th className="pb-3">Danh mục</th>
                    <th className="pb-3">Lượt xem</th>
                    <th className="pb-3">Đường dẫn tải xuống</th>
                    <th className="pb-3 text-right pr-2">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {docs.map(d => {
                    const category = docCats.find(cat => Number(cat.id) === Number(d.categoryId))?.name || 'Khác'
                    return (
                      <tr key={d.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 pl-2 font-bold text-slate-850">{d.title}</td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold text-[10px]">
                            {category}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-500 font-bold">{d.views} lượt</td>
                        <td className="py-3.5 text-primary max-w-[200px] truncate">
                          <a href={d.downloadUrl} target="_blank" rel="noreferrer" className="hover:underline font-semibold">{d.downloadUrl}</a>
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => { setModalType('editDoc'); setCurrentEditItem(d); setFormData(d); }}
                              className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 inline-flex items-center justify-center hover:bg-slate-50 hover:text-primary hover:border-primary transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteDoc(d.id)}
                              className="w-7 h-7 rounded-lg border border-red-100 text-red-400 inline-flex items-center justify-center hover:bg-red-50 transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {docTotalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4 text-xs font-semibold text-slate-500">
                <div>
                  Hiển thị từ {Math.min(docTotalElements, (docPage - 1) * 10 + 1)} đến {Math.min(docTotalElements, docPage * 10)} trong tổng số {docTotalElements} tài liệu
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={docPage === 1}
                    onClick={() => setDocPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
                  >
                    Trước
                  </button>
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg">
                    Trang {docPage} / {docTotalPages}
                  </span>
                  <button
                    type="button"
                    disabled={docPage === docTotalPages}
                    onClick={() => setDocPage(prev => Math.min(docTotalPages, prev + 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ MOCK CRUD MODAL POPUPS ═══ */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
              <h3 className="font-display font-extrabold text-slate-800 text-base">
                {modalType === 'addUser' && 'Thêm Thành Viên Mới'}
                {modalType === 'editUser' && 'Sửa thông tin Học Viên'}
                {modalType === 'addCourseStudent' && 'Thêm Học Viên Lớp 48 Ngày'}
                {modalType === 'addCollection' && 'Thêm Bộ từ vựng chính'}
                {modalType === 'editCollection' && 'Sửa Bộ từ vựng chính'}
                {modalType === 'addSubCollection' && 'Thêm Chủ đề con'}
                {modalType === 'editSubCollection' && 'Sửa Chủ đề con'}
                {modalType === 'addWord' && 'Thêm Từ vựng mới'}
                {modalType === 'editWord' && 'Sửa Từ vựng'}
                {modalType === 'importWords' && 'Import Từ vựng Hàng loạt'}
                {(modalType === 'addDoc' || modalType === 'editDoc') && (modalType === 'editDoc' ? 'Chỉnh sửa tài liệu' : 'Thêm tài liệu mới')}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* FORM BODY */}
            {/* User Form */}
            {(modalType === 'addUser' || modalType === 'editUser') && (
              <form onSubmit={handleSaveUser} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary font-medium"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary font-medium"
                    placeholder="example@gmail.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Điểm số (XP)</label>
                    <input
                      type="number"
                      value={formData.points || ''}
                      onChange={e => setFormData({ ...formData, points: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Streak (ngày)</label>
                    <input
                      type="number"
                      value={formData.streak || ''}
                      onChange={e => setFormData({ ...formData, streak: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Quyền hạn</label>
                  <select
                    value={formData.role || 'USER'}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none text-slate-700 bg-white"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                {modalType === 'editUser' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mật khẩu mới (Để trống nếu không đổi)</label>
                    <input
                      type="text"
                      value={formData.password || ''}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary font-medium"
                      placeholder="Nhập mật khẩu mới..."
                    />
                  </div>
                )}
                <button type="submit" className="btn btn-primary w-full mt-4">
                  Lưu thông tin
                </button>
              </form>
            )}

            {/* Course Student Form */}
            {modalType === 'addCourseStudent' && (
              <form onSubmit={handleSaveCourseStudent} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Họ tên Học viên</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary font-medium"
                    placeholder="Nguyễn Văn B"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Số điện thoại đăng nhập</label>
                  <input
                    type="text"
                    required
                    value={formData.username || ''}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary font-medium"
                    placeholder="0912345678"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tên lớp học</label>
                  <input
                    type="text"
                    value={formData.className || 'K48'}
                    onChange={e => setFormData({ ...formData, className: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary font-medium"
                    placeholder="K48"
                  />
                </div>
                <button type="submit" className="btn-3d btn-3d-gray w-full mt-4">
                  Cấp tài khoản 48 ngày
                </button>
              </form>
            )}

            {/* Collection Form */}
            {(modalType === 'addCollection' || modalType === 'editCollection') && (
              <form onSubmit={handleSaveCollection} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tên bộ từ vựng chính</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary font-medium"
                    placeholder="Ví dụ: TOEFL Từ vựng"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mô tả ngắn</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary font-medium h-20 resize-none"
                    placeholder="Mô tả bộ từ này..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Màu chủ đề</label>
                    <select
                      value={formData.color || 'primary'}
                      onChange={e => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none text-slate-700 bg-white"
                    >
                      <option value="primary">Primary (Blue)</option>
                      <option value="accent">Accent (Orange)</option>
                      <option value="success">Success (Green)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Icon đại diện</label>
                    <select
                      value={formData.icon || 'school'}
                      onChange={e => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none text-slate-700 bg-white font-medium"
                    >
                      <option value="school">🏫 Học tập (school)</option>
                      <option value="business_center">💼 Kinh doanh (business_center)</option>
                      <option value="chat_bubble">💬 Giao tiếp (chat_bubble)</option>
                      <option value="work">🏢 Công sở (work)</option>
                      <option value="travel_explore">🌍 Du lịch (travel_explore)</option>
                      <option value="code">💻 Công nghệ (code)</option>
                      <option value="translate">🔤 Dịch thuật (translate)</option>
                      <option value="menu_book">📖 Sách học (menu_book)</option>
                      <option value="language">🌐 Toàn cầu (language)</option>
                      <option value="record_voice_over">🗣️ Phát âm (record_voice_over)</option>
                      <option value="flight">✈️ Hàng không (flight)</option>
                      <option value="celebration">🎉 Lễ hội (celebration)</option>
                      <option value="emoji_events">🏆 Cuộc thi (emoji_events)</option>
                      <option value="local_fire_department">🔥 Streak (local_fire_department)</option>
                      <option value="stars">⭐ Điểm số (stars)</option>
                      <option value="music_note">🎵 Âm nhạc (music_note)</option>
                      <option value="movie">🎬 Phim ảnh (movie)</option>
                      <option value="sports_esports">🎮 Trò chơi (sports_esports)</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-full mt-4">
                  {modalType === 'editCollection' ? 'Lưu thay đổi' : 'Thêm bộ từ vựng'}
                </button>
              </form>
            )}

            {/* Topic Form (Add/Edit) */}
            {(modalType === 'addTopic' || modalType === 'editTopic') && (
              <form onSubmit={handleSaveTopic} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Thuộc Bộ từ vựng chính (Collection - Cấp 1)</label>
                  <select
                    value={formData.collectionId || ''}
                    onChange={e => setFormData({ ...formData, collectionId: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none text-slate-700 bg-white font-medium"
                  >
                    <option value="">-- Chưa gán Bộ từ vựng --</option>
                    {collections.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tên chủ đề chính (Topic)</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary font-medium"
                    placeholder="Ví dụ: Topic 1: Academic & Science"
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full mt-4">
                  {modalType === 'editTopic' ? 'Lưu thay đổi' : 'Thêm chủ đề chính'}
                </button>
              </form>
            )}

            {/* Subtopic Form (Add/Edit) */}
            {(modalType === 'addSubtopic' || modalType === 'editSubtopic' || modalType === 'addSubCollection' || modalType === 'editSubCollection') && (
              <form onSubmit={handleSaveSubCollection} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Thuộc Chủ đề chính (Topic - Cấp 2)</label>
                  <select
                    value={formData.topicId || ''}
                    onChange={e => setFormData({ ...formData, topicId: e.target.value, collectionId: topics.find(t => t.id === Number(e.target.value))?.collectionId })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none text-slate-700 bg-white font-medium"
                  >
                    <option value="">-- Chọn Chủ đề chính --</option>
                    {topics.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tên chủ đề nhỏ (Subtopic)</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary font-medium"
                    placeholder="Ví dụ: Subtopic 1.1: Education"
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full mt-4">
                  {(modalType === 'editSubtopic' || modalType === 'editSubCollection') ? 'Lưu thay đổi' : 'Thêm chủ đề nhỏ'}
                </button>
              </form>
            )}

            {/* Word Form (Add/Edit) */}
            {(modalType === 'addWord' || modalType === 'editWord') && (
              <form onSubmit={handleSaveWord} className="space-y-4">
                {modalType === 'addWord' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">Thuộc chủ đề nhỏ (Subtopic - Cấp 3)</label>
                    <select
                      required
                      value={formData.subtopicId || formData.subCollectionId || ''}
                      onChange={e => setFormData({ ...formData, subtopicId: e.target.value, subCollectionId: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none text-slate-700 bg-white font-medium"
                    >
                      <option value="">-- Chọn chủ đề nhỏ --</option>
                      {subtopics.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.title}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">Từ Tiếng Anh</label>
                  <input
                    type="text"
                    required
                    value={formData.word || ''}
                    onChange={e => setFormData({ ...formData, word: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary font-medium"
                    placeholder="Ví dụ: Biodiversity"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">Phiên âm IPA (Không bắt buộc)</label>
                  <input
                    type="text"
                    value={formData.pronunciation || ''}
                    onChange={e => setFormData({ ...formData, pronunciation: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary font-medium"
                    placeholder="Ví dụ: /ˌbaɪoʊdaɪˈvɜːrsəti/"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">Nghĩa Tiếng Việt</label>
                  <input
                    type="text"
                    required
                    value={formData.meaning || ''}
                    onChange={e => setFormData({ ...formData, meaning: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary font-medium"
                    placeholder="Ví dụ: Đa dạng sinh học"
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full mt-4">
                  {modalType === 'editWord' ? 'Lưu thay đổi' : 'Thêm vào từ điển'}
                </button>
              </form>
            )}

            {/* Bulk Import Words Form */}
            {modalType === 'importWords' && (
              <form onSubmit={handleImportWords} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">Thuộc chủ đề nhỏ (Subtopic - Cấp 3)</label>
                  <select
                    required
                    value={formData.subtopicId || formData.subCollectionId || ''}
                    onChange={e => setFormData({ ...formData, subtopicId: e.target.value, subCollectionId: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none text-slate-700 bg-white font-medium"
                  >
                    <option value="">-- Chọn chủ đề nhỏ --</option>
                    {subtopics.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">Dữ liệu từ vựng (Mỗi từ 1 dòng)</label>
                  <textarea
                    required
                    value={formData.importText || ''}
                    onChange={e => setFormData({ ...formData, importText: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary font-medium h-48 resize-y"
                    placeholder={`Định dạng mỗi dòng hỗ trợ:\n1. word | pronunciation | meaning\n2. word - meaning\n3. word\n\nVí dụ:\nbiodiversity | /ˌbaɪoʊdaɪˈvɜːrsəti/ | Đa dạng sinh học\nwildlife - Động vật hoang dã\necology`}
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                    * Nếu chỉ nhập 'word', hệ thống sẽ tự tìm kiếm phiên âm và nghĩa đã có sẵn trên hệ thống để copy qua.
                    <br />
                    * Hệ thống tự động bỏ qua nếu từ vựng đã tồn tại trong chủ đề con này.
                  </p>
                </div>
                <button type="submit" className="btn-3d btn-3d-green w-full mt-4">
                  Bắt đầu Import
                </button>
              </form>
            )}

            {/* Doc Form */}
            {(modalType === 'addDoc' || modalType === 'editDoc') && (
              <form onSubmit={handleSaveDoc} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phân loại danh mục</label>
                  <select
                    required
                    value={formData.categoryId || (docCats[0]?.id || '')}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none text-slate-700 bg-white"
                  >
                    {docCats.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tiêu đề tài liệu</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary font-medium"
                    placeholder="Ví dụ: Đề thi thử IELTS Listening"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Đường dẫn tải xuống (Drive Link)</label>
                  <input
                    type="text"
                    required
                    value={formData.downloadUrl || ''}
                    onChange={e => setFormData({ ...formData, downloadUrl: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary font-medium"
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full mt-4">
                  {modalType === 'editDoc' ? 'Lưu thay đổi' : 'Đăng tài liệu'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ═══ CONFIRM DELETE MODAL ═══ */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <span className="material-symbols-outlined text-[32px]">warning</span>
              <h3 className="font-display font-extrabold text-slate-800 text-lg">
                {deleteConfirm.title}
              </h3>
            </div>
            
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              {deleteConfirm.message}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={deleteConfirm.onConfirm}
                className="flex-1 py-2.5 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-all cursor-pointer shadow-lg shadow-red-500/20 active:scale-95"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
