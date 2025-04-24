/**
 * Supabase Mocks
 * Mock functions for testing Supabase interactions
 */

// In-memory database for tests
const mockDatabase = {
  bets: [],
};

// Event handlers
let eventHandlers = {
  INSERT: () => {},
  UPDATE: () => {},
  DELETE: () => {},
};

// Error handler
let errorHandler = () => {};

/**
 * Mock Supabase client
 */
export const mockSupabaseClient = {
  setData: (table, data) => {
    mockDatabase[table] = [...data];
  },

  resetData: () => {
    Object.keys(mockDatabase).forEach((table) => {
      mockDatabase[table] = [];
    });
  },

  setEventHandlers: (handlers) => {
    eventHandlers = { ...eventHandlers, ...handlers };
  },

  setErrorHandler: (handler) => {
    errorHandler = handler;
  },

  triggerEvent: (eventType, payload) => {
    // Call the handler first so tests can verify the callback
    if (eventHandlers[eventType]) {
      eventHandlers[eventType]({ eventType, ...payload });
    }

    // Then update the in-memory database
    if (eventType === "INSERT" && payload.new) {
      mockDatabase.bets = [...mockDatabase.bets, payload.new];
    } else if (eventType === "UPDATE" && payload.new) {
      const index = mockDatabase.bets.findIndex(
        (bet) => bet.id === payload.old.id
      );
      if (index !== -1) {
        mockDatabase.bets[index] = payload.new;
      }
    } else if (eventType === "DELETE" && payload.old) {
      mockDatabase.bets = mockDatabase.bets.filter(
        (bet) => bet.id !== payload.old.id
      );
    }
  },

  triggerError: (error) => {
    if (errorHandler) {
      errorHandler(error);
    }
  },

  from: (table) => ({
    select: () => ({
      order: () => ({
        range: () => ({
          eq: (column, value) => ({
            data: mockDatabase[table].filter(
              (record) => record[column] === value
            ),
            error: null,
          }),
          data: mockDatabase[table],
          error: null,
        }),
      }),
    }),
  }),

  channel: (name) => ({
    on: (event, filter, callback) => ({
      subscribe: () => ({
        unsubscribe: () => console.log(`Unsubscribed from ${name}`),
      }),
    }),
  }),

  removeSubscription: (subscription) => {
    console.log("Mock: Removing subscription");
  },
};
