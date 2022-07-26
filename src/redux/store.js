import { configureStore } from '@reduxjs/toolkit'
import orderBookReducer from './orderBookReducer'
export default configureStore({
    reducer: {
        orderBook: orderBookReducer,
      },
})