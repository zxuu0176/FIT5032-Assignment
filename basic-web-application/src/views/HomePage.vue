<template>
  <div class="home-page">
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <div class="text-center mb-5">
            <h1>Welcome to Basketball Programs</h1>
            <p class="lead">Join our international student basketball community</p>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h3>{{ totalRegistrations }}</h3>
              <p class="text-muted mb-0">Total Students</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h3>{{ totalBookings }}</h3>
              <p class="text-muted mb-0">Sessions Booked</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h3>{{ programs.length }}</h3>
              <p class="text-muted mb-0">Programs</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h3>{{ averageRating }}</h3>
              <p class="text-muted mb-0">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-header">
              <h5>Program Enrollment</h5>
            </div>
            <div class="card-body">
              <div ref="enrollmentChart" class="chart-container"></div>
            </div>
          </div>
        </div>

        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-header">
              <h5>Student Experience Levels</h5>
            </div>
            <div class="card-body">
              <div ref="experienceChart" class="chart-container"></div>
            </div>
          </div>
        </div>

        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-header">
              <h5>Monthly Registrations</h5>
            </div>
            <div class="card-body">
              <div ref="monthlyChart" class="chart-container"></div>
            </div>
          </div>
        </div>

        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-header">
              <h5>Student Countries</h5>
            </div>
            <div class="card-body">
              <div ref="countryChart" class="chart-container"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body text-center">
              <h4>Ready to Join?</h4>
              <p>Explore our programs and book your first session today!</p>
              <div class="d-flex justify-content-center gap-3">
                <router-link to="/resource" class="btn btn-primary btn-lg">
                  View Programs
                </router-link>
                <router-link to="/contact" class="btn btn-outline-secondary btn-lg">
                  Contact Us
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { initdb } from '../firebase/init';
import { collection, getDocs } from "firebase/firestore";
import * as echarts from 'echarts';

const totalRegistrations = ref(0);
const totalBookings = ref(0);
const averageRating = ref(0);
const programs = ref([]);

const enrollmentChart = ref(null);
const experienceChart = ref(null);
const monthlyChart = ref(null);
const countryChart = ref(null);

let enrollmentChartInstance = null;
let experienceChartInstance = null;
let monthlyChartInstance = null;
let countryChartInstance = null;

programs.value = [
  { title: "Beginner International League", enrollments: 45 },
  { title: "Intermediate Skills Program", enrollments: 32 },
  { title: "Competitive League", enrollments: 28 },
  { title: "Cultural Exchange Program", enrollments: 38 }
];

const fetchData = async () => {
  const db = initdb();

  try {
    const registrationsSnapshot = await getDocs(collection(db, "registrations"));
    totalRegistrations.value = registrationsSnapshot.size;

    const bookingsSnapshot = await getDocs(collection(db, "bookings"));
    totalBookings.value = bookingsSnapshot.size;

    const ratingsSnapshot = await getDocs(collection(db, "ratings"));
    if (ratingsSnapshot.size > 0) {
      const totalRating = ratingsSnapshot.docs.reduce((sum, doc) => {
        return sum + (doc.data().rating || 0);
      }, 0);
      averageRating.value = (totalRating / ratingsSnapshot.size).toFixed(1);
    }

    setTimeout(initializeCharts, 100);

  } catch (error) {
    console.error('Error fetching data:', error);
    setTimeout(initializeCharts, 100);
  }
};

const initializeCharts = () => {
  if (enrollmentChart.value) {
    enrollmentChartInstance = echarts.init(enrollmentChart.value);
    enrollmentChartInstance.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          name: 'Enrollments',
          type: 'pie',
          radius: '70%',
          data: programs.value.map(program => ({
            value: program.enrollments,
            name: program.title
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    });
  }

  if (experienceChart.value) {
    experienceChartInstance = echarts.init(experienceChart.value);
    experienceChartInstance.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: ['Beginner', 'Intermediate', 'Advanced']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [65, 34, 23],
          type: 'bar',
          itemStyle: {
            color: '#4e73df'
          }
        }
      ]
    });
  }

  if (monthlyChart.value) {
    monthlyChartInstance = echarts.init(monthlyChart.value);
    monthlyChartInstance.setOption({
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [12, 18, 23, 25, 32, 45],
          type: 'line',
          smooth: true,
          lineStyle: {
            color: '#1cc88a'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0,
                color: 'rgba(28, 200, 138, 0.3)'
              }, {
                offset: 1,
                color: 'rgba(28, 200, 138, 0)'
              }]
            }
          }
        }
      ]
    });
  }

  if (countryChart.value) {
    countryChartInstance = echarts.init(countryChart.value);
    countryChartInstance.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      series: [
        {
          name: 'Countries',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 35, name: 'China' },
            { value: 25, name: 'India' },
            { value: 18, name: 'South Korea' },
            { value: 15, name: 'Japan' },
            { value: 7, name: 'Other' }
          ]
        }
      ]
    });
  }
};

const handleResize = () => {
  enrollmentChartInstance?.resize();
  experienceChartInstance?.resize();
  monthlyChartInstance?.resize();
  countryChartInstance?.resize();
};

onMounted(() => {
  fetchData();
  window.addEventListener('resize', handleResize);
});

import { onUnmounted } from 'vue';
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  enrollmentChartInstance?.dispose();
  experienceChartInstance?.dispose();
  monthlyChartInstance?.dispose();
  countryChartInstance?.dispose();
});
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
}

.card-header {
  background-color: #fff;
  border-bottom: 1px solid #e3e6f0;
  font-weight: 600;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.text-center h1 {
  color: #01030a;
  font-weight: 700;
}

.lead {
  color: #6e707e;
  font-size: 1.1rem;
}

.btn-lg {
  padding: 0.75rem 2rem;
  font-weight: 600;
}

.card.text-center .card-body h3 {
  color: #2e59d9;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
</style>
