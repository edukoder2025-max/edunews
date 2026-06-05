'use client';

/**
 * Google Subscribe with Google (SWG) SDK client
 * Handles opening contribution/subscription dialogs and webhook integration
 */

interface SWGSubscribeRequest {
  productId?: string;
  onSuccess?: () => void;
  onFailure?: (error: Error) => void;
}

interface SWGEntitlementResult {
  isUserEntitled: boolean;
  data?: any;
}

interface SWGBasic {
  attachButtonEl: (element: HTMLElement, options: any) => void;
  attachPendingDialog: () => void;
  detachButtonEl: (element: HTMLElement) => void;
  getEntitlements: (onSuccess: (result: SWGEntitlementResult) => void, onFailure?: (error: Error) => void) => void;
  init: (publicationId: string) => void;
  linkAccount: (onSuccess?: () => void, onFailure?: (error: Error) => void) => void;
  updateEligibility: (options: any) => void;
  reset: () => void;
  openContribution: (request: SWGSubscribeRequest) => void;
  openDialog: (request?: any) => void;
  showLoginPrompt: () => void;
  showLoginNotification: () => void;
  setOnEntitlementsResponse: (handler: (response: any) => void) => void;
  setOnLinkComplete: (handler: () => void) => void;
  setOnLoginRequest: (handler: () => void) => void;
  setOnPaymentResponse: (handler: (response: any) => void) => void;
  setOnSubscribeResponse: (handler: (response: any) => void) => void;
}

declare global {
  interface Window {
    SWG_BASIC?: SWGBasic;
    swgUserToken?: string;
  }
}

/**
 * Initialize Google Subscribe with Google SDK
 */
export function initializeSWG(publicationId: string): void {
  if (!publicationId) {
    console.error('❌ Publication ID is required for SWG initialization');
    return;
  }

  const checkSWGAndInit = () => {
    if (window.SWG_BASIC) {
      try {
        window.SWG_BASIC.init(publicationId);
        
        // Set up event handlers
        window.SWG_BASIC.setOnEntitlementsResponse((response: any) => {
          console.log('📦 Entitlements response:', response);
          handleEntitlementsResponse(response);
        });

        window.SWG_BASIC.setOnSubscribeResponse((response: any) => {
          console.log('✅ Subscribe response:', response);
          handleSubscribeResponse(response);
        });

        window.SWG_BASIC.setOnLinkComplete(() => {
          console.log('🔗 Link complete');
          handleLinkComplete();
        });

        console.log('✅ SWG SDK initialized successfully');
      } catch (err) {
        console.error('❌ Error initializing SWG:', err);
      }
    } else {
      setTimeout(checkSWGAndInit, 100);
    }
  };

  checkSWGAndInit();
}

/**
 * Open subscription dialog for a specific product
 */
export async function openSWGDialog(productId?: string): Promise<boolean> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.warn('⚠️ SWG SDK did not load within 5 seconds');
      resolve(false);
    }, 5000);

    const checkSWG = () => {
      if (window.SWG_BASIC) {
        clearTimeout(timeout);
        try {
          if (productId) {
            window.SWG_BASIC.openContribution({ productId });
          } else {
            window.SWG_BASIC.openDialog();
          }
          resolve(true);
        } catch (err) {
          console.error('❌ Error opening SWG dialog:', err);
          resolve(false);
        }
      } else {
        setTimeout(checkSWG, 100);
      }
    };

    checkSWG();
  });
}

/**
 * Get user entitlements
 */
export async function getUserEntitlements(): Promise<SWGEntitlementResult | null> {
  return new Promise((resolve) => {
    if (!window.SWG_BASIC) {
      console.error('❌ SWG SDK not initialized');
      resolve(null);
      return;
    }

    window.SWG_BASIC.getEntitlements(
      (result: SWGEntitlementResult) => {
        resolve(result);
      },
      (error: Error) => {
        console.error('❌ Error getting entitlements:', error);
        resolve(null);
      }
    );
  });
}

/**
 * Handle entitlements response from SWG
 */
function handleEntitlementsResponse(response: any): void {
  console.log('📦 Processing entitlements response');
}

/**
 * Handle subscribe response from SWG
 */
async function handleSubscribeResponse(response: any): Promise<void> {
  try {
    const { email, name } = response;
    console.log('🔄 Processing subscription response...');
  } catch (err) {
    console.error('❌ Error handling subscribe response:', err);
  }
}

/**
 * Handle link complete
 */
function handleLinkComplete(): void {
  console.log('🔗 Account linking complete');
}

/**
 * Attach SWG button to element
 */
export function attachSWGButton(element: HTMLElement): void {
  if (!window.SWG_BASIC) {
    console.error('❌ SWG SDK not initialized');
    return;
  }

  try {
    window.SWG_BASIC.attachButtonEl(element, {
      theme: 'light',
      lang: 'es',
    });
  } catch (err) {
    console.error('❌ Error attaching SWG button:', err);
  }
}

/**
 * Backward compatibility function
 */
export async function openSWGContributionDialog(productId?: string): Promise<boolean> {
  return openSWGDialog(productId);
}

/**
 * Check if SWG is available
 */
export function isSWGAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.SWG_BASIC;
}
