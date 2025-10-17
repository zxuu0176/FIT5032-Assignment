<template>
  <div v-if="role === 'admin'" class="admin-page">
    <h1>Welcome to the Admin Page</h1>
    <p>Welcome, {{userEmail}}.</p>

    <div class="table-container">
      <div class="table-header">
        <h2>Bulk Email Tool</h2>
      </div>

      <div class="p-4">
        <div class="mb-4">
          <label class="form-label fw-bold">Email Subject:</label>
          <input
            v-model="emailSubject"
            type="text"
            class="form-control"
            placeholder="Enter email subject"
            :disabled="selectedUsers.length === 0"
          >
        </div>

        <div class="mb-4">
          <label class="form-label fw-bold">Email Message:</label>
          <textarea
            v-model="emailMessage"
            class="form-control"
            rows="6"
            placeholder="Enter your email message here..."
            :disabled="selectedUsers.length === 0"
          ></textarea>
          <small class="text-muted">You can use HTML formatting in your message.</small>
        </div>

        <div class="mb-4">
          <label class="form-label fw-bold">Select Recipients:</label>
          <div class="mb-2">
            <button @click="selectAllUsers" class="btn btn-outline-primary btn-sm me-2">
              Select All Users ({{ users.length }})
            </button>
            <button @click="selectFilteredUsers" class="btn btn-outline-primary btn-sm me-2">
              Select Filtered Results ({{ filteredUsers.length }})
            </button>
            <button @click="clearSelection" class="btn btn-outline-secondary btn-sm">
              Clear Selection
            </button>
          </div>
          <div class="selected-users-info">
            <span class="badge bg-primary">
              {{ selectedUsers.length }} users selected
            </span>
            <small class="text-muted ms-2">
              Click on users in the table below to select/deselect individually
            </small>
          </div>
        </div>

        <div class="mb-4">
          <button
            @click="sendBulkEmail"
            :disabled="!canSendEmail"
            class="btn btn-success btn-lg"
          >
            <span v-if="isSending" class="spinner-border spinner-border-sm me-2"></span>
            {{ isSending ? 'Sending Emails...' : `Send Bulk Email to ${selectedUsers.length} Users` }}
          </button>
        </div>

        <div v-if="emailResults" class="mt-4 p-3 rounded" :class="emailResults.success ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'">
          <h5>Email Results:</h5>
          <p><strong>Successfully sent:</strong> {{ emailResults.summary.totalSent }} emails</p>
          <p><strong>Failed:</strong> {{ emailResults.summary.totalFailed }} emails</p>
          <p><strong>Success rate:</strong> {{ emailResults.summary.successRate }}</p>

          <div v-if="emailResults.results.failed.length > 0" class="mt-3">
            <h6>Failed Emails:</h6>
            <ul class="list-group">
              <li v-for="failed in emailResults.results.failed" :key="failed.email" class="list-group-item">
                <strong>{{ failed.email }}</strong> - {{ failed.error }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="table-container mt-4">
      <div class="table-header">
        <h2>Users Management</h2>
        <div class="header-actions">
          <button @click="exportToPDF" class="export-btn">
            Export to PDF
          </button>
        </div>
      </div>

      <div class="column-search-container">
        <div class="search-inputs">
          <input
            v-for="(col, index) in searchColumns"
            :key="index"
            v-model="col.search"
            type="text"
            :placeholder="col.placeholder"
            class="column-search-input"
            @input="applyColumnSearch"
          />
        </div>
      </div>

      <table id="usersTable" class="table table-striped table-bordered" style="width:100%">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                :checked="allUsersSelected"
                @change="toggleSelectAll"
                class="form-check-input"
              >
            </th>
            <th @click="sortTable('id')" class="sortable">
              ID
              <span v-if="sortField === 'id'" class="sort-indicator">
                {{ sortDirection === 'asc' ? '&#9650;' : '&#9660;' }}
              </span>
            </th>
            <th @click="sortTable('first_name')" class="sortable">
              First Name
              <span v-if="sortField === 'first_name'" class="sort-indicator">
                {{ sortDirection === 'asc' ? '&#9650;' : '&#9660;' }}
              </span>
            </th>
            <th @click="sortTable('last_name')" class="sortable">
              Last Name
              <span v-if="sortField === 'last_name'" class="sort-indicator">
                {{ sortDirection === 'asc' ? '&#9650;' : '&#9660;' }}
              </span>
            </th>
            <th @click="sortTable('full_name')" class="sortable">
              Full Name
              <span v-if="sortField === 'full_name'" class="sort-indicator">
                {{ sortDirection === 'asc' ? '&#9650;' : '&#9660;' }}
              </span>
            </th>
            <th @click="sortTable('email')" class="sortable">
              Email
              <span v-if="sortField === 'email'" class="sort-indicator">
                {{ sortDirection === 'asc' ? '&#9650;' : '&#9660;' }}
              </span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in paginatedUsers"
            :key="user.id"
            :class="{ 'table-primary': isUserSelected(user.id) }"
            @click="toggleUserSelection(user.id)"
            style="cursor: pointer;"
          >
            <td @click.stop>
              <input
                type="checkbox"
                :checked="isUserSelected(user.id)"
                @change="toggleUserSelection(user.id)"
                class="form-check-input"
              >
            </td>
            <td>{{ user.id }}</td>
            <td>{{ user.first_name }}</td>
            <td>{{ user.last_name }}</td>
            <td>{{ user.full_name }}</td>
            <td>{{ user.email }}</td>
            <td @click.stop>
              <button @click="viewUser(user.id)" class="action-btn view-btn">View</button>
              <button @click="editUser(user.id)" class="action-btn edit-btn">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredUsers.length === 0" class="no-data-message">
        No users found matching your search criteria.
      </div>

      <div v-if="filteredUsers.length > 0" class="pagination-controls">
        <div class="pagination-info">
          Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredUsers.length }} entries
        </div>
        <div class="pagination-buttons">
          <button
            @click="previousPage"
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            Previous
          </button>
          <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            Next
          </button>
          <select v-model="pageSize" @change="resetPagination" class="page-size-select">
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      </div>
    </div>

    <div class="table-container mt-4">
      <div class="table-header">
        <h2>User Statistics</h2>
      </div>

      <table class="stats-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stat in userStats" :key="stat.metric">
            <td>{{ stat.metric }}</td>
            <td>{{ stat.value }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-else class="admin-page">
    <p v-if="role === 'user'">Sorry {{ userEmail }}, you are not an admin.</p>
    <p v-else>You need to log in first.</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../functions/role';

const userEmail = ref(null);
let unsubscribe = null;
const roleAuth = useAuth();
const role = ref(null);

const emailSubject = ref('');
const emailMessage = ref('');
const selectedUsers = ref([]);
const emailResults = ref(null);
const isSending = ref(false);

onMounted(() => {
  const auth = getAuth()
  unsubscribe = onAuthStateChanged(auth, (user) => {
    userEmail.value = user ? user.email : null;
    roleAuth.getRole(userEmail.value);
    role.value = roleAuth.role;
    if (role.value === 'admin') {
      loadUserData();
    }
  })
});

onUnmounted(() => {
  if (typeof unsubscribe === 'function') unsubscribe()
});

const users = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const sortField = ref('id');
const sortDirection = ref('asc');

const searchColumns = ref([
  {
    title: 'ID',
    search: '',
    field: 'id',
    placeholder: 'Exact ID match...',
    type: 'number'
  },
  {
    title: 'First Name',
    search: '',
    field: 'first_name',
    placeholder: 'Search first names...',
    type: 'text'
  },
  {
    title: 'Last Name',
    search: '',
    field: 'last_name',
    placeholder: 'Search last names...',
    type: 'text'
  },
  {
    title: 'Full Name',
    search: '',
    field: 'full_name',
    placeholder: 'Search full names...',
    type: 'text'
  },
  {
    title: 'Email',
    search: '',
    field: 'email',
    placeholder: 'Search emails...',
    type: 'text'
  }
]);

const canSendEmail = computed(() => {
  return emailSubject.value &&
         emailMessage.value &&
         selectedUsers.value.length > 0 &&
         !isSending.value;
});

const allUsersSelected = computed(() => {
  return paginatedUsers.value.length > 0 &&
         paginatedUsers.value.every(user => selectedUsers.value.includes(user.id));
});

const selectAllUsers = () => {
  selectedUsers.value = users.value.map(user => user.id);
};

const selectFilteredUsers = () => {
  selectedUsers.value = filteredUsers.value.map(user => user.id);
};

const clearSelection = () => {
  selectedUsers.value = [];
};

const toggleSelectAll = () => {
  if (allUsersSelected.value) {
    paginatedUsers.value.forEach(user => {
      const index = selectedUsers.value.indexOf(user.id);
      if (index > -1) {
        selectedUsers.value.splice(index, 1);
      }
    });
  } else {
    paginatedUsers.value.forEach(user => {
      if (!selectedUsers.value.includes(user.id)) {
        selectedUsers.value.push(user.id);
      }
    });
  }
};

const toggleUserSelection = (userId) => {
  const index = selectedUsers.value.indexOf(userId);
  if (index > -1) {
    selectedUsers.value.splice(index, 1);
  } else {
    selectedUsers.value.push(userId);
  }
};

const isUserSelected = (userId) => {
  return selectedUsers.value.includes(userId);
};

const getSelectedUserEmails = () => {
  return users.value
    .filter(user => selectedUsers.value.includes(user.id))
    .map(user => user.email);
};

const BULK_EMAIL_FUNCTION_URL = 'https://us-central1-basic-web-application-a7857.cloudfunctions.net/sendBulkEmail';

const sendBulkEmail = async () => {
  if (!canSendEmail.value) return;

  isSending.value = true;
  emailResults.value = null;

  try {
    const selectedEmails = getSelectedUserEmails();

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();

    const response = await fetch(BULK_EMAIL_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userEmails: selectedEmails,
        subject: emailSubject.value,
        message: emailMessage.value,
        emailType: 'admin-bulk'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    emailResults.value = result;

  } catch (error) {
    console.error('Bulk email failed:', error);
  } finally {
    isSending.value = false;
  }
};

const loadUserData = async () => {
  try {
    const response = await import('../data/mock_user.json');
    users.value = response.default.map(user => ({
      ...user,
      full_name: `${user.first_name} ${user.last_name}`
    }));
  } catch (error) {
    console.error('Error loading user data:', error);
    users.value = [];
  }
};

const filteredUsers = computed(() => {
  let filtered = [...users.value];

  searchColumns.value.forEach(col => {
    if (col.search.trim()) {
      filtered = filtered.filter(user => {
        const userValue = user[col.field];

        if (col.type === 'number') {
          const searchNum = parseInt(col.search);
          if (isNaN(searchNum)) return false;
          return userValue === searchNum;
        } else {
          const value = String(userValue).toLowerCase();
          return value.includes(col.search.toLowerCase());
        }
      });
    }
  });

  filtered.sort((a, b) => {
    let aValue = a[sortField.value];
    let bValue = b[sortField.value];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1;
    return 0;
  });

  return filtered;
});

const paginatedUsers = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filteredUsers.value.slice(startIndex, endIndex);
});

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / pageSize.value);
});

const startIndex = computed(() => {
  return (currentPage.value - 1) * pageSize.value;
});

const endIndex = computed(() => {
  const end = startIndex.value + pageSize.value;
  return end > filteredUsers.value.length ? filteredUsers.value.length : end;
});

const applyColumnSearch = () => {
  currentPage.value = 1;
};

const sortTable = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = 'asc';
  }
  currentPage.value = 1;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const resetPagination = () => {
  currentPage.value = 1;
};

const userStats = computed(() => {
  const stats = [];
  if (users.value.length > 0) {
    stats.push({
      metric: 'Total Users',
      value: users.value.length
    });
    stats.push({
      metric: 'Users with Gmail',
      value: users.value.filter(user => user.email.includes('gmail')).length
    });
    stats.push({
      metric: 'Unique First Names',
      value: new Set(users.value.map(user => user.first_name)).size
    });
    stats.push({
      metric: 'Unique Last Names',
      value: new Set(users.value.map(user => user.last_name)).size
    });
    stats.push({
      metric: 'Average Name Length',
      value: (users.value.reduce((acc, user) => acc + user.first_name.length, 0) / users.value.length).toFixed(2)
    });
  }
  return stats;
});

const exportToPDF = async () => {
  try {
    const { jsPDF } = await import('jspdf');

    let autoTableAvailable = false;
    try {
      await import('jspdf-autotable');
      autoTableAvailable = true;
    } catch {
      console.warn('jspdf-autotable not available, using manual table creation');
    }

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Users Management Report', 14, 15);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableData = filteredUsers.value.map(user => [
      user.id,
      user.first_name,
      user.last_name,
      user.email
    ]);

    if (autoTableAvailable && typeof doc.autoTable === 'function') {
      doc.autoTable({
        startY: 30,
        head: [['ID', 'First Name', 'Last Name', 'Email']],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
        margin: { top: 30 }
      });

      const statsData = userStats.value.map(stat => [
        stat.metric,
        stat.value
      ]);

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Metric', 'Value']],
        body: statsData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [40, 167, 69] },
        margin: { top: 20 }
      });
    } else {
      let yPosition = 30;
      const lineHeight = 7;
      const colWidths = [15, 40, 40, 80];

      doc.setFillColor(66, 139, 202);
      doc.setTextColor(255, 255, 255);
      doc.rect(14, yPosition, colWidths[0], lineHeight, 'F');
      doc.text('ID', 16, yPosition + 5);
      doc.rect(14 + colWidths[0], yPosition, colWidths[1], lineHeight, 'F');
      doc.text('First Name', 16 + colWidths[0], yPosition + 5);
      doc.rect(14 + colWidths[0] + colWidths[1], yPosition, colWidths[2], lineHeight, 'F');
      doc.text('Last Name', 16 + colWidths[0] + colWidths[1], yPosition + 5);
      doc.rect(14 + colWidths[0] + colWidths[1] + colWidths[2], yPosition, colWidths[3], lineHeight, 'F');
      doc.text('Email', 16 + colWidths[0] + colWidths[1] + colWidths[2], yPosition + 5);

      yPosition += lineHeight;
      doc.setTextColor(0, 0, 0);

      tableData.forEach(row => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        doc.text(row[0].toString(), 16, yPosition + 5);
        doc.text(row[1], 16 + colWidths[0], yPosition + 5);
        doc.text(row[2], 16 + colWidths[0] + colWidths[1], yPosition + 5);
        doc.text(row[3], 16 + colWidths[0] + colWidths[1] + colWidths[2], yPosition + 5);

        yPosition += lineHeight;
      });

      yPosition += 10;
      doc.setFillColor(40, 167, 69);
      doc.setTextColor(255, 255, 255);
      doc.rect(14, yPosition, 180, lineHeight, 'F');
      doc.text('Statistics', 16, yPosition + 5);

      yPosition += lineHeight;
      doc.setTextColor(0, 0, 0);

      userStats.value.forEach(stat => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(stat.metric, 16, yPosition + 5);
        doc.text(stat.value.toString(), 100, yPosition + 5);
        yPosition += lineHeight;
      });
    }

    doc.save(`users-report-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again or check the console for details.');
  }
};

const viewUser = (userId) => {
  const user = users.value.find(u => u.id === userId);
  if (user) {
    alert(`Viewing user:\nID: ${user.id}\nName: ${user.first_name} ${user.last_name}\nEmail: ${user.email}`);
  }
};

const editUser = (userId) => {
  const user = users.value.find(u => u.id === userId);
  if (user) {
    alert(`Editing user: ${user.first_name} ${user.last_name}\nThis would open an edit form in a real application.`);
  }
};
</script>

<style scoped>
.selected-users-info {
  margin-top: 10px;
}

.form-check-input {
  margin: 0;
}

.table-primary {
  background-color: #e3f2fd !important;
}

.admin-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}
</style>
