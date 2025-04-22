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
  /**
   * Set data for a table
   * @param {string} table - Table name
   * @param {Array} data - Array of records
   */
  setData: (table, data) => {
    if (!mockDatabase[table]) {
      mockDatabase[table] = [];
    }

    mockDatabase[table] = [...data];
  },

  /**
   * Reset all data
   */
  resetData: () => {
    Object.keys(mockDatabase).forEach((table) => {
      mockDatabase[table] = [];
    });
  },

  /**
   * Set event handlers
   * @param {Object} handlers - Event handlers
   */
  setEventHandlers: (handlers) => {
    eventHandlers = { ...eventHandlers, ...handlers };
  },

  /**
   * Set error handler
   * @param {Function} handler - Error handler
   */
  setErrorHandler: (handler) => {
    errorHandler = handler;
  },

  /**
   * Trigger an event
   * @param {string} eventType - Event type (INSERT, UPDATE, DELETE)
   * @param {Object} payload - Event payload
   */
  triggerEvent: (eventType, payload) => {
    // Update the in-memory database to match the event
    if (eventType === "INSERT" && payload.new) {
      mockDatabase.bets.push(payload.new);
    } else if (eventType === "UPDATE" && payload.old && payload.new) {
      const index = mockDatabase.bets.findIndex(
        (bet) => bet.id === payload.old.id
      );
      if (index !== -1) {
        mockDatabase.bets[index] = payload.new;
      }
    } else if (eventType === "DELETE" && payload.old) {
      const index = mockDatabase.bets.findIndex(
        (bet) => bet.id === payload.old.id
      );
      if (index !== -1) {
        mockDatabase.bets.splice(index, 1);
      }
    }

    // Call the appropriate handler
    if (eventHandlers[eventType]) {
      eventHandlers[eventType]({ eventType, ...payload });
    }
  },

  /**
   * Trigger an error
   * @param {Error} error - Error to trigger
   */
  triggerError: (error) => {
    if (errorHandler) {
      errorHandler(error);
    }
  },

  /**
   * Mock channel methods for Realtime
   */
  channel: (name) => {
    return {
      on: (event, filter, callback) => {
        console.log(`Subscribed to ${event} on ${name} with filter:`, filter);
        return {
          subscribe: () => {
            console.log(`Subscription to ${name} active`);
            return {
              // Return the channel for chaining
              unsubscribe: () => {
                console.log(`Unsubscribed from ${name}`);
              },
            };
          },
        };
      },
    };
  },

  /**
   * Mock Supabase query methods
   */
  from: (table) => {
    return {
      select: (columns) => {
        return {
          eq: (column, value) => {
            return {
              data: mockDatabase[table].filter(
                (record) => record[column] === value
              ),
              error: null,
            };
          },
          range: (start, end) => {
            return {
              data: mockDatabase[table].slice(start, end),
              error: null,
            };
          },
          order: (column, options) => {
            return {
              range: (start, end) => {
                let sorted = [...mockDatabase[table]];

                if (options && options.ascending === false) {
                  sorted.reverse();
                }

                return {
                  data: sorted.slice(start, end),
                  error: null,
                };
              },
              eq: (column, value) => {
                return {
                  data: mockDatabase[table].filter(
                    (record) => record[column] === value
                  ),
                  error: null,
                };
              },
              data: mockDatabase[table],
              error: null,
            };
          },
          single: () => {
            return {
              data: mockDatabase[table][0] || null,
              error: null,
            };
          },
          data: mockDatabase[table],
          error: null,
        };
      },
      insert: (records) => {
        const newRecords = Array.isArray(records) ? records : [records];
        mockDatabase[table].push(...newRecords);

        return {
          data: newRecords,
          error: null,
        };
      },
      update: (updates) => {
        return {
          eq: (column, value) => {
            const index = mockDatabase[table].findIndex(
              (record) => record[column] === value
            );

            if (index !== -1) {
              mockDatabase[table][index] = {
                ...mockDatabase[table][index],
                ...updates,
              };

              return {
                data: mockDatabase[table][index],
                error: null,
              };
            }

            return {
              data: null,
              error: { message: "Record not found" },
            };
          },
        };
      },
      delete: () => {
        return {
          eq: (column, value) => {
            const index = mockDatabase[table].findIndex(
              (record) => record[column] === value
            );

            if (index !== -1) {
              const deleted = mockDatabase[table].splice(index, 1)[0];

              return {
                data: deleted,
                error: null,
              };
            }

            return {
              data: null,
              error: { message: "Record not found" },
            };
          },
        };
      },
    };
  },

  /**
   * Mock Supabase auth methods
   */
  auth: {
    getSession: async () => {
      return {
        data: {
          session: {
            user: {
              id: "test-user-id",
              email: "test@example.com",
            },
          },
        },
        error: null,
      };
    },
  },

  /**
   * Mock Supabase storage methods
   */
  storage: {
    from: (bucket) => {
      return {
        upload: (path, file) => {
          console.log(`Uploading ${path} to ${bucket}`);
          return {
            data: { path },
            error: null,
          };
        },
        getPublicUrl: (path) => {
          return {
            data: { publicUrl: `https://example.com/${bucket}/${path}` },
          };
        },
      };
    },
  },

  /**
   * Remove channel subscription
   */
  removeChannel: (channel) => {
    console.log("Removing channel");
    // In a real test, would remove the subscription
  },
};
