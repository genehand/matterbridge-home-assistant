import { BooleanStateCluster, MatterbridgeDevice } from 'matterbridge';
import { Entity } from '../../home-assistant/entity/entity.js';
import { MatterAspect } from './matter-aspect.js';

export interface BooleanStateAspectConfig {
  invert?: boolean;
}

export class BooleanStateAspect extends MatterAspect<Entity> {
  constructor(
    private readonly device: MatterbridgeDevice,
    entity: Entity,
    private readonly config?: BooleanStateAspectConfig,
  ) {
    super(entity.entity_id);
    this.log.setLogName('BooleanStateAspect');
    device.createDefaultBooleanStateClusterServer(this.isOn(entity));
  }

  private get booleanStateCluster() {
    return this.device.getClusterServer(BooleanStateCluster);
  }

  async update(state: Entity): Promise<void> {
    const booleanStateClusterServer = this.booleanStateCluster!;
    const isOn = this.isOn(state);
    if (booleanStateClusterServer.getStateValueAttribute() !== isOn) {
      this.log.debug(`FROM HA: ${state.entity_id} changed boolean state to ${state.state}`);
      booleanStateClusterServer.setStateValueAttribute(isOn);
    }
  }

  private isOn(entity: Entity): boolean {
    const isNotOff = entity.state !== 'off';
    if (this.config?.invert == true) {
      return !isNotOff;
    } else {
      return isNotOff;
    }
  }
}
