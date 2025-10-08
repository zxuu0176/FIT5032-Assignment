<template>
  <div v-if="role === 'admin'" class="admin-page">
    <h1>Welcome to the Admin Page</h1>
    <p>Welcome, {{userEmail}}.</p>

    <!-- Users Table -->
    <div class="table-container">
      <div class="table-header">
        <h2>Users Management</h2>
        <div class="header-actions">
          <button @click="exportToPDF" class="export-btn">
            Export to PDF
          </button>
        </div>
      </div>

      <!-- Individual Column Search Inputs -->
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
          <tr v-for="user in paginatedUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.first_name }}</td>
            <td>{{ user.last_name }}</td>
            <td>{{ user.full_name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <button @click="viewUser(user.id)" class="action-btn view-btn">View</button>
              <button @click="editUser(user.id)" class="action-btn edit-btn">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Show message when no data -->
      <div v-if="filteredUsers.length === 0" class="no-data-message">
        No users found matching your search criteria.
      </div>

      <!-- Pagination Controls -->
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

    <!-- Statistics Table -->
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

// Reactive data
const users = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const sortField = ref('id');
const sortDirection = ref('asc');

// Column search states with better placeholders
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

// Load user data from mock_user.json
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

// Computed property for filtered users based on column searches
const filteredUsers = computed(() => {
  let filtered = [...users.value];

  // Apply column-specific searches
  searchColumns.value.forEach(col => {
    if (col.search.trim()) {
      filtered = filtered.filter(user => {
        const userValue = user[col.field];

        // Handle different field types
        if (col.type === 'number') {
          // For ID field, use exact match or starts with for numbers
          const searchNum = parseInt(col.search);
          if (isNaN(searchNum)) return false;
          return userValue === searchNum;
        } else {
          // For text fields, use case-insensitive contains
          const value = String(userValue).toLowerCase();
          return value.includes(col.search.toLowerCase());
        }
      });
    }
  });

  // Apply sorting
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

// Computed property for paginated users
const paginatedUsers = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filteredUsers.value.slice(startIndex, endIndex);
});

// Total pages computed
const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / pageSize.value);
});

// Pagination indices
const startIndex = computed(() => {
  return (currentPage.value - 1) * pageSize.value;
});

const endIndex = computed(() => {
  const end = startIndex.value + pageSize.value;
  return end > filteredUsers.value.length ? filteredUsers.value.length : end;
});

// Apply column search
const applyColumnSearch = () => {
  currentPage.value = 1; // Reset to first page when searching
};

// Sort table
const sortTable = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = 'asc';
  }
  currentPage.value = 1;
};

// Pagination methods
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

// Statistics table data (second table)
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

// Export to PDF function with fallback
const exportToPDF = async () => {
  try {
    // Dynamically import jsPDF and autoTable to avoid bundle issues
    const { jsPDF } = await import('jspdf');

    // Check if autoTable is available, if not use manual table creation
    let autoTableAvailable = false;
    try {
      // Try to import autoTable
      await import('jspdf-autotable');
      autoTableAvailable = true;
    } catch {
      console.warn('jspdf-autotable not available, using manual table creation');
    }

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text('Users Management Report', 14, 15);

    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    // Prepare table data
    const tableData = filteredUsers.value.map(user => [
      user.id,
      user.first_name,
      user.last_name,
      user.email
    ]);

    if (autoTableAvailable && typeof doc.autoTable === 'function') {
      // Use autoTable if available
      doc.autoTable({
        startY: 30,
        head: [['ID', 'First Name', 'Last Name', 'Email']],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
        margin: { top: 30 }
      });

      // Add statistics table
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
      // Manual table creation fallback
      let yPosition = 30;
      const lineHeight = 7;
      const colWidths = [15, 40, 40, 80];

      // Draw table headers
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

      // Draw table rows
      tableData.forEach(row => {
        if (yPosition > 270) { // Add new page if needed
          doc.addPage();
          yPosition = 20;
        }

        doc.text(row[0].toString(), 16, yPosition + 5);
        doc.text(row[1], 16 + colWidths[0], yPosition + 5);
        doc.text(row[2], 16 + colWidths[0] + colWidths[1], yPosition + 5);
        doc.text(row[3], 16 + colWidths[0] + colWidths[1] + colWidths[2], yPosition + 5);

        yPosition += lineHeight;
      });

      // Add statistics section
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

    // Save the PDF
    doc.save(`users-report-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again or check the console for details.');
  }
};

// Action functions
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
/* ... (keep all the existing styles exactly as they are) ... */
</style>
