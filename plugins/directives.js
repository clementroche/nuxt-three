import Vue from 'vue'

import IntersectionObserver from '@/directives/intersection-observer.js'
import Kinesis from '@/directives/kinesis.js'

Vue.directive('intersection-observer', IntersectionObserver)
Vue.directive('kinesis', Kinesis)
