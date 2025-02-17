Idea: In sign in page, apart from next sign in, show a transition zoom in zoom out type video that showcases app in action, like booking.
# User Flow:
# Local or Session Storage
- Save user preferences (like favorite rooms, probably by clicking a favorite icon) (room page)
- Store recently viewed rooms (If user opens room availibility calendar view for a room, add it to to top of recently viewed rooms) (Store maybe 10 most recent rooms)

# State Management
- Use React Query to handle room and booking data fetching (update room and booking data on update from server) (when users book something, edit/delete something or when admin does CRUD operation)
- Implement optimistic updates (update UI immediately) (when initiating mutation, use onMutate option to update cache with new data, if mutation fails, roll back changes) (update local state or cache immediately)
- Implement cache invalidation (Use invalidateQueries method to trigger refetch of data after mutation (like adding or updating data)) (Example: After a mutation (like adding or updating data), you can call queryClient.invalidateQueries('yourQueryKey') to refresh the data.)

# Other technical things
### Frontend
- Implement proper laoding and error states.
- Implement form validation with React-hook-form and Zod.
- Use tailwindcss for design
- Implement proper typescript types.
### Backend
- Restful API endpoints
- Proper error handling and status codes
- Request validation
- Handle concurrent booking attempts
### Database
- Use MySQL as database
- Handle Database migrations
- Implement efficient queries (optimize queries)

- Organize code efficiently, readably
- Create Good documentation
- Create .env.example
- Seed data

## Non-Authenticated Users

- Cannot do anything (login page)

## Authenticated User

- Login/Sign Up
- See list of all rooms with filtering (capacity, amenities) (Room page)
- For each room, user can favorite it.
- Clicking on room shows room availability calendar view (or something similar/not mandatory) (Room page/ Availibility page)
- Show room availibility in 30 minute slots (room page)
- Create a new booking (from room page)
- View all bookings (booking page)
- Edit/Cancel existing bookings (only logged in user's bookings) (booking page)
- Prevent double booking (booking page)
- Image upload. (use free cloud service like cloudinary) (booking page/create-new-booking)
- Log out

## Admin User

- Login normally, cannot sign up as admin.
- Do CRUD operations on all bookings and rooms (regardless of user) (admin page?)
- Log out


