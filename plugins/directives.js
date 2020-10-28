import Vue from 'vue'

import { ObserveVisibility } from 'vue-observe-visibility'
import Kinesis from '@/directives/kinesis.js'
import Cursor from '@/directives/cursor.js'

Vue.directive('kinesis', Kinesis)
Vue.directive('observe-visibility', ObserveVisibility)
Vue.directive('cursor', Cursor)
