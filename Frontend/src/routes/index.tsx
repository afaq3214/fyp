import { createBrowserRouter } from 'react-router-dom';
import { DiscoveryHub } from '../components/DiscoveryHub';
import { UserProfile } from '../components/UserProfile';
import { ProductDetail } from '../components/ProductDetail';
import { AdminPanel } from '../components/AdminPanel';
import App from '../App';
import { EditProfile } from '../components/EditProfile';
import { AuthPage } from '../components/AuthPage';
import  SubmitProduct   from  '../components/Pages/SubmitProduct'
import  EditProduct   from  '../components/Pages/EditProduct'
import  ProductOwner   from  '../components/Pages/ProductOwner'
import { ChallengeQuests } from '@/components/Pages/Quests';
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <DiscoveryHub  />  // Remove props, use hooks inside component
      },
      {
        path: '/profile/:userId',
        element: <UserProfile />   // Remove props, use useParams hook inside
      },
      {
        path: '/product/:productId',
        element: <ProductDetail /> // Already correct
      },
      {
        path: '/admin',
        element: <AdminPanel />   // Already correct
      },{
        path: '/edit-profile/:userId',
        element: <EditProfile />   // Already correct
      },{
        path: '/SubmitProduct',
        element: <SubmitProduct />   // Already correct
      },{
        path: '/edit-product/:productId',
        element: <EditProduct />   // Edit product page
      },{
        path: '/product-owner/:ownerId',
        element: <ProductOwner />   // Product owner profile page
      },{
        path: '/quests',
        element: <ChallengeQuests />   // Quests page
      }
            
    ]
  }
]);